package server

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"bergeerd-api/internal/config"
	"bergeerd-api/internal/handler"
	"bergeerd-api/internal/middleware"
	"bergeerd-api/internal/auth"
)

// New builds the configured Gin engine with all routes registered.
func New(
	cfg *config.Config,
	authH *handler.AuthHandler,
	menuH *handler.MenuHandler,
	categoryH *handler.CategoryHandler,
	jwtSvc *auth.JWTService,
) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.LoggerWithFormatter(loggerFormatter))
	r.Use(gin.Recovery())

	// CORS — allow the configured origins (admin panel + website).
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSOrigins,
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check (public, no auth).
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		// Public read endpoints (no auth) — used by the website.
		// These return dynamic data that changes whenever the admin edits
		// items/categories, so we send explicit no-cache headers to prevent
		// browsers (and any CDN/proxy) from serving a stale copy on refetch.
		// Without this, the website can show outdated ordering even after the
		// admin saves, because fetch() may return a cached 200 without hitting
		// the network.
		pub := api.Group("")
		pub.Use(noCacheMiddleware)
		{
			pub.GET("/menu", menuH.ListPublic)
			pub.GET("/categories", categoryH.ListPublic)
		}

		// Auth endpoints.
		authGrp := api.Group("/auth")
		{
			authGrp.POST("/login", authH.Login)
		}

		// Admin endpoints (JWT-protected).
		admin := api.Group("/admin")
		admin.Use(middleware.JWTAuth(jwtSvc))
		{
			admin.GET("/menu", menuH.ListAll)
			admin.GET("/menu/:id", menuH.Get)
			admin.POST("/menu", menuH.Create)
			admin.PUT("/menu/:id", menuH.Update)
			admin.DELETE("/menu/:id", menuH.Delete)
			admin.POST("/upload", menuH.UploadImage)

			admin.GET("/categories", categoryH.ListAll)
			admin.GET("/categories/:id", categoryH.Get)
			admin.POST("/categories", categoryH.Create)
			admin.PUT("/categories/:id", categoryH.Update)
			admin.DELETE("/categories/:id", categoryH.Delete)
		}
	}

	return r
}

// noCacheMiddleware sets strict no-cache headers so browsers and proxies never
// serve a stale copy of dynamic public data (menu items/categories). The admin
// can change ordering/content at any time, and the website must always see the
// latest state on refetch.
func noCacheMiddleware(c *gin.Context) {
	c.Header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	c.Next()
}

// loggerFormatter produces concise single-line access logs.
func loggerFormatter(param gin.LogFormatterParams) string {
	if param.Latency > time.Minute {
		param.Latency = param.Latency.Truncate(time.Second)
	}
	return strings.Join([]string{
		param.TimeStamp.Format("2006-01-02 15:04:05"),
		param.ClientIP,
		param.Method,
		param.Path,
		param.StatusCodeColor(),
		http.StatusText(param.StatusCode),
		param.ResetColor(),
		param.Latency.String(),
		"\n",
	}, " ")
}
