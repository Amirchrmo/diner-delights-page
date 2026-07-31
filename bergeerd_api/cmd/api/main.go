package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"bergeerd-api/internal/auth"
	"bergeerd-api/internal/config"
	"bergeerd-api/internal/database"
	"bergeerd-api/internal/handler"
	"bergeerd-api/internal/repository"
	"bergeerd-api/internal/seeder"
	"bergeerd-api/internal/server"
	"bergeerd-api/internal/service"
	"bergeerd-api/internal/storage"
)

func main() {
	cfg := config.Load()
	log.Printf("starting bergeerd-api — %s", cfg.String())

	// --- Infrastructure: MongoDB ---
	db, err := database.ConnectMongo(cfg.MongoURI, cfg.MongoDatabase)
	if err != nil {
		log.Fatalf("mongo: %v", err)
	}
	defer func() {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = db.Client().Disconnect(ctx)
	}()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	menuRepo := repository.NewMenuItemRepo(db)
	adminRepo := repository.NewAdminRepo(db)
	categoryRepo := repository.NewCategoryRepo(db)
	if err := menuRepo.EnsureIndexes(ctx); err != nil {
		log.Fatalf("menu indexes: %v", err)
	}
	if err := adminRepo.EnsureIndexes(ctx); err != nil {
		log.Fatalf("admin indexes: %v", err)
	}
	if err := categoryRepo.EnsureIndexes(ctx); err != nil {
		log.Fatalf("category indexes: %v", err)
	}

	// --- Dynamic categories ---
	categorySvc := service.NewCategoryService(categoryRepo)
	if err := categorySvc.SeedIfEmpty(ctx, seeder.DefaultCategories()); err != nil {
		log.Printf("seed categories: %v", err)
	} else {
		if n, err := categoryRepo.Count(ctx); err == nil {
			log.Printf("seed categories: %d categories present", n)
		}
	}

	// --- Infrastructure: MinIO ---
	store, err := storage.NewMinio(cfg.MinioEndpoint, cfg.MinioAccessKey, cfg.MinioSecretKey,
		cfg.MinioBucket, cfg.MinioPublicURL, cfg.MinioUseSSL)
	if err != nil {
		log.Fatalf("minio: %v", err)
	}

	// --- Seeding ---
	if cfg.SeedAdmin {
		authSvc := service.NewAuthService(adminRepo, auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpHours))
		if err := authSvc.SeedAdminIfEmpty(ctx, cfg.AdminUsername, cfg.AdminPassword); err != nil {
			log.Printf("seed admin: %v", err)
		} else {
			log.Printf("seed admin: ensured admin user %q exists", cfg.AdminUsername)
		}
	}

	menuSvc := service.NewMenuService(menuRepo, store, categorySvc)
	if cfg.SeedMenu {
		// SEED_IMAGES_DIR optionally points at the website's src/assets so the
		// seeder uploads the existing product photos to MinIO on first run.
		imagesDir := os.Getenv("SEED_IMAGES_DIR")
		items := seeder.BuildSeedItems(ctx, store, imagesDir)
		if err := menuSvc.SeedIfEmpty(ctx, items); err != nil {
			log.Printf("seed menu: %v", err)
		} else {
			n, _ := menuSvc.Count(ctx)
			log.Printf("seed menu: %d items present", n)
		}
	}

	// --- HTTP server ---
	jwtSvc := auth.NewJWTService(cfg.JWTSecret, cfg.JWTExpHours)
	authH := handler.NewAuthHandler(service.NewAuthService(adminRepo, jwtSvc))
	menuH := handler.NewMenuHandler(menuSvc, categorySvc)
	categoryH := handler.NewCategoryHandler(categorySvc)

	router := server.New(cfg, authH, menuH, categoryH, jwtSvc)

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	// Graceful shutdown.
	go func() {
		log.Printf("http server listening on :%s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutting down...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("forced shutdown: %v", err)
	}
	log.Println("server stopped")
}
