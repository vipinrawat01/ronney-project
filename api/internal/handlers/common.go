package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/alliraa/api/internal/config"
	"github.com/alliraa/api/internal/middleware"
	"github.com/alliraa/api/internal/models"
	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"golang.org/x/crypto/bcrypt"
)

type API struct {
	DB  *sql.DB
	Cfg config.Config
}

func (a *API) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func (a *API) writeError(w http.ResponseWriter, status int, msg string) {
	a.writeJSON(w, status, map[string]string{"error": msg})
}

func (a *API) decodeJSON(r *http.Request, dest any) error {
	defer r.Body.Close()
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	return dec.Decode(dest)
}

var nonSlug = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	s = nonSlug.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func formatMoney(cents int, currency string) string {
	sym := "$"
	switch strings.ToLower(currency) {
	case "eur":
		sym = "€"
	case "gbp":
		sym = "£"
	case "inr":
		sym = "₹"
	}
	return fmt.Sprintf("%s%.2f", sym, float64(cents)/100)
}

func nullStr(s *string) any {
	if s == nil || *s == "" {
		return nil
	}
	return *s
}

func nullUint(u *uint64) any {
	if u == nil {
		return nil
	}
	return *u
}

func nullInt(i *int) any {
	if i == nil {
		return nil
	}
	return *i
}

func nullFloat(f *float64) any {
	if f == nil {
		return nil
	}
	return *f
}

func strPtr(ns sql.NullString) *string {
	if !ns.Valid {
		return nil
	}
	v := ns.String
	return &v
}

func intPtr(ni sql.NullInt64) *int {
	if !ni.Valid {
		return nil
	}
	v := int(ni.Int64)
	return &v
}

func floatPtr(nf sql.NullFloat64) *float64 {
	if !nf.Valid {
		return nil
	}
	v := nf.Float64
	return &v
}

func uintPtr(ni sql.NullInt64) *uint64 {
	if !ni.Valid {
		return nil
	}
	v := uint64(ni.Int64)
	return &v
}

// ---------- Auth ----------

func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := a.decodeJSON(r, &req); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	var admin models.Admin
	err := a.DB.QueryRow(`SELECT id, email, password_hash, name, created_at, updated_at FROM admins WHERE email = ?`, req.Email).
		Scan(&admin.ID, &admin.Email, &admin.PasswordHash, &admin.Name, &admin.CreatedAt, &admin.UpdatedAt)
	if err == sql.ErrNoRows {
		a.writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)) != nil {
		a.writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	token, err := middleware.IssueToken(a.Cfg.JWTSecret, admin.ID, admin.Email)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "token error")
		return
	}
	a.writeJSON(w, http.StatusOK, models.LoginResponse{Token: token, Admin: admin})
}

func (a *API) Me(w http.ResponseWriter, r *http.Request) {
	id, _ := r.Context().Value(middleware.AdminIDKey).(uint64)
	var admin models.Admin
	err := a.DB.QueryRow(`SELECT id, email, name, created_at, updated_at FROM admins WHERE id = ?`, id).
		Scan(&admin.ID, &admin.Email, &admin.Name, &admin.CreatedAt, &admin.UpdatedAt)
	if err != nil {
		a.writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	a.writeJSON(w, http.StatusOK, admin)
}

// ---------- Upload ----------

func (a *API) Upload(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseMultipartForm(20 << 20); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	file, header, err := r.FormFile("file")
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "file required")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	switch ext {
	case ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif":
	default:
		a.writeError(w, http.StatusBadRequest, "unsupported file type")
		return
	}

	name := fmt.Sprintf("%d_%s", time.Now().UnixNano(), slugify(strings.TrimSuffix(header.Filename, ext)))

	if a.Cfg.UseCloudinary() {
		url, err := a.uploadToCloudinary(r.Context(), file, name)
		if err != nil {
			a.writeError(w, http.StatusInternalServerError, "cloudinary upload failed: "+err.Error())
			return
		}
		a.writeJSON(w, http.StatusOK, map[string]string{"url": url})
		return
	}

	if err := os.MkdirAll(a.Cfg.UploadDir, 0o755); err != nil {
		a.writeError(w, http.StatusInternalServerError, "upload dir error")
		return
	}
	destPath := filepath.Join(a.Cfg.UploadDir, name+ext)
	out, err := os.Create(destPath)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer out.Close()
	if _, err := io.Copy(out, file); err != nil {
		a.writeError(w, http.StatusInternalServerError, "could not write file")
		return
	}
	url := a.Cfg.PublicBaseURL + "/uploads/" + name + ext
	a.writeJSON(w, http.StatusOK, map[string]string{"url": url})
}

func (a *API) uploadToCloudinary(ctx context.Context, file io.Reader, publicID string) (string, error) {
	cld, err := cloudinary.NewFromParams(a.Cfg.CloudinaryCloudName, a.Cfg.CloudinaryAPIKey, a.Cfg.CloudinaryAPISecret)
	if err != nil {
		return "", err
	}
	res, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		Folder:   a.Cfg.CloudinaryUploadFolder,
		PublicID: publicID,
	})
	if err != nil {
		return "", err
	}
	if res.Error.Message != "" {
		return "", fmt.Errorf(res.Error.Message)
	}
	return res.SecureURL, nil
}

func parseID(r *http.Request) (uint64, error) {
	if id := r.PathValue("id"); id != "" {
		return strconv.ParseUint(id, 10, 64)
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) == 0 {
		return 0, fmt.Errorf("missing id")
	}
	return strconv.ParseUint(parts[len(parts)-1], 10, 64)
}

func pathID(r *http.Request) string {
	if id := r.PathValue("id"); id != "" {
		return id
	}
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	if len(parts) == 0 {
		return ""
	}
	return parts[len(parts)-1]
}
