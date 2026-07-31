package config

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all runtime configuration loaded from the environment.
type Config struct {
	AppEnv         string
	Port           string
	LogLevel       string
	JWTSecret      string
	JWTExpHours    int
	SeedAdmin      bool
	AdminUsername  string
	AdminPassword  string
	SeedMenu       bool
	MongoURI       string
	MongoDatabase  string
	MinioEndpoint  string
	MinioAccessKey string
	MinioSecretKey string
	MinioBucket    string
	MinioUseSSL    bool
	MinioPublicURL string
	CORSOrigins    []string
}

// Load reads configuration from .env (if present) and the process environment.
// Missing required values cause a fatal error so misconfiguration fails fast.
func Load() *Config {
	// .env is optional (production usually injects env vars directly).
	_ = godotenv.Load()

	cfg := &Config{
		AppEnv:         getEnv("APP_ENV", "development"),
		Port:           getEnv("PORT", "8080"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		JWTSecret:      getEnv("JWT_SECRET", ""),
		JWTExpHours:    getEnvInt("JWT_EXPIRES_HOURS", 24),
		SeedAdmin:      getEnvBool("SEED_ADMIN", true),
		AdminUsername:  getEnv("ADMIN_USERNAME", "admin"),
		AdminPassword:  getEnv("ADMIN_PASSWORD", "admin123"),
		SeedMenu:       getEnvBool("SEED_MENU", true),
		MongoURI:       getEnv("MONGO_URI", "mongodb://localhost:27017"),
		MongoDatabase:  getEnv("MONGO_DATABASE", "bergeerd"),
		MinioEndpoint:  getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey: getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		MinioSecretKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
		MinioBucket:    getEnv("MINIO_BUCKET", "bergeerd"),
		MinioUseSSL:    getEnvBool("MINIO_USE_SSL", false),
		MinioPublicURL: strings.TrimRight(getEnv("MINIO_PUBLIC_URL", "http://localhost:9000"), "/"),
		CORSOrigins:    parseCSV(getEnv("CORS_ORIGINS", "*")),
	}

	if cfg.JWTSecret == "" {
		log.Fatal("config: JWT_SECRET must be set")
	}
	if cfg.MinioPublicURL == "" {
		log.Fatal("config: MINIO_PUBLIC_URL must be set")
	}

	return cfg
}

// IsProduction reports whether the app runs in production mode.
func (c *Config) IsProduction() bool { return c.AppEnv == "production" }

func getEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return fallback
}

func parseCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if t := strings.TrimSpace(p); t != "" {
			out = append(out, t)
		}
	}
	return out
}

// DSN returns the MongoDB database name for convenience.
func (c *Config) String() string {
	return fmt.Sprintf("env=%s port=%s db=%s minio=%s bucket=%s",
		c.AppEnv, c.Port, c.MongoDatabase, c.MinioEndpoint, c.MinioBucket)
}
