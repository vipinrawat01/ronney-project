package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	MySQLDSN      string
	JWTSecret     string
	AdminEmail    string
	AdminPassword string
	UploadDir     string
	PublicBaseURL string
	CORSOrigins   []string

	CloudinaryCloudName    string
	CloudinaryAPIKey       string
	CloudinaryAPISecret    string
	CloudinaryUploadFolder string
}

// UseCloudinary reports whether Cloudinary credentials are configured.
func (c Config) UseCloudinary() bool {
	return c.CloudinaryCloudName != "" && c.CloudinaryAPIKey != "" && c.CloudinaryAPISecret != ""
}

func Load() Config {
	_ = godotenv.Load()

	origins := strings.Split(getEnv("CORS_ORIGINS", "http://localhost:3000"), ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	return Config{
		Port:          getEnv("PORT", "8080"),
		MySQLDSN:      getEnv("MYSQL_DSN", "alliraa:alliraa@tcp(127.0.0.1:3306)/alliraa?parseTime=true&charset=utf8mb4&loc=Local"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@alliraa.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),
		UploadDir:     getEnv("UPLOAD_DIR", "./uploads"),
		PublicBaseURL: strings.TrimRight(getEnv("PUBLIC_BASE_URL", "http://localhost:8080"), "/"),
		CORSOrigins:   origins,

		CloudinaryCloudName:    getEnv("CLOUDINARY_CLOUD_NAME", ""),
		CloudinaryAPIKey:       getEnv("CLOUDINARY_API_KEY", ""),
		CloudinaryAPISecret:    getEnv("CLOUDINARY_API_SECRET", ""),
		CloudinaryUploadFolder: getEnv("CLOUDINARY_UPLOAD_FOLDER", "alliraa"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
