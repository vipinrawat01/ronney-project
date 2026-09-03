package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/alliraa/api/internal/config"
	"github.com/alliraa/api/internal/database"
	"github.com/alliraa/api/internal/handlers"
	"github.com/alliraa/api/internal/middleware"
)

func main() {
	cfg := config.Load()

	if err := os.MkdirAll(cfg.UploadDir, 0o755); err != nil {
		log.Fatalf("upload dir: %v", err)
	}

	db, err := database.Connect(cfg.MySQLDSN)
	if err != nil {
		log.Fatalf("mysql: %v", err)
	}
	defer db.Close()

	if err := database.EnsureAdmin(db, cfg); err != nil {
		log.Fatalf("seed admin: %v", err)
	}
	if err := database.EnsureCategoryFabricsColumn(db); err != nil {
		log.Fatalf("migrate category fabrics: %v", err)
	}
	if err := database.EnsureCategoryPrintsColumn(db); err != nil {
		log.Fatalf("migrate category prints: %v", err)
	}
	if err := database.EnsureBranding(db); err != nil {
		log.Fatalf("seed branding: %v", err)
	}

	api := &handlers.API{DB: db, Cfg: cfg}
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/store/products", api.ListProducts)
	mux.HandleFunc("GET /api/store/products/{id}", api.GetProduct)
	mux.HandleFunc("GET /api/store/categories", api.ListCategories)
	mux.HandleFunc("GET /api/store/variants", api.ListVariantInventory)
	mux.HandleFunc("GET /api/store/branding", api.GetBranding)

	mux.HandleFunc("POST /api/admin/login", api.Login)

	auth := middleware.RequireAuth(cfg.JWTSecret)
	mux.Handle("GET /api/admin/me", auth(http.HandlerFunc(api.Me)))
	mux.Handle("POST /api/admin/upload", auth(http.HandlerFunc(api.Upload)))

	mux.Handle("GET /api/admin/categories", auth(http.HandlerFunc(api.ListCategories)))
	mux.Handle("POST /api/admin/categories", auth(http.HandlerFunc(api.CreateCategory)))
	mux.Handle("GET /api/admin/categories/{id}", auth(http.HandlerFunc(api.GetCategory)))
	mux.Handle("PUT /api/admin/categories/{id}", auth(http.HandlerFunc(api.UpdateCategory)))
	mux.Handle("DELETE /api/admin/categories/{id}", auth(http.HandlerFunc(api.DeleteCategory)))

	mux.Handle("GET /api/admin/products", auth(http.HandlerFunc(api.ListProducts)))
	mux.Handle("POST /api/admin/products", auth(http.HandlerFunc(api.CreateProduct)))
	mux.Handle("GET /api/admin/products/{id}", auth(http.HandlerFunc(api.GetProduct)))
	mux.Handle("PUT /api/admin/products/{id}", auth(http.HandlerFunc(api.UpdateProduct)))
	mux.Handle("DELETE /api/admin/products/{id}", auth(http.HandlerFunc(api.DeleteProduct)))

	mux.Handle("GET /api/admin/branding", auth(http.HandlerFunc(api.GetBranding)))
	mux.Handle("PUT /api/admin/branding", auth(http.HandlerFunc(api.UpdateBranding)))

	mux.Handle("/uploads/", http.StripPrefix("/uploads/", http.FileServer(http.Dir(cfg.UploadDir))))

	adminDir := resolveAdminDir()
	mux.Handle("/admin/", http.StripPrefix("/admin/", http.FileServer(http.Dir(adminDir))))
	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/admin/", http.StatusFound)
	})

	handler := middleware.CORS(cfg.CORSOrigins)(mux)

	log.Printf("Alliraa API listening on :%s", cfg.Port)
	log.Printf("Admin panel: %s/admin/", cfg.PublicBaseURL)
	log.Printf("Default admin: %s / %s", cfg.AdminEmail, cfg.AdminPassword)
	if err := http.ListenAndServe(":"+cfg.Port, handler); err != nil {
		log.Fatal(err)
	}
}

func resolveAdminDir() string {
	candidates := []string{
		"web/admin",
		"./web/admin",
		filepath.Join("..", "..", "web", "admin"),
	}
	if exe, err := os.Executable(); err == nil {
		candidates = append(candidates, filepath.Join(filepath.Dir(exe), "web", "admin"))
		candidates = append(candidates, filepath.Join(filepath.Dir(exe), "..", "web", "admin"))
	}
	for _, c := range candidates {
		if info, err := os.Stat(filepath.Join(c, "index.html")); err == nil && !info.IsDir() {
			abs, _ := filepath.Abs(c)
			return abs
		}
	}
	return "web/admin"
}
