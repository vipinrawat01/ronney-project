package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"github.com/alliraa/api/internal/models"
)

func (a *API) readBranding() (models.Branding, error) {
	var raw string
	err := a.DB.QueryRow(`SELECT data_json FROM store_branding WHERE id = 1`).Scan(&raw)
	if err == sql.ErrNoRows {
		return models.DefaultBranding(), nil
	}
	if err != nil {
		return models.Branding{}, err
	}
	var b models.Branding
	if err := json.Unmarshal([]byte(raw), &b); err != nil {
		return models.DefaultBranding(), nil
	}
	return models.MergeBrandingDefaults(b), nil
}

func (a *API) GetBranding(w http.ResponseWriter, r *http.Request) {
	b, err := a.readBranding()
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	a.writeJSON(w, http.StatusOK, map[string]any{"branding": b})
}

func (a *API) UpdateBranding(w http.ResponseWriter, r *http.Request) {
	var req models.Branding
	dec := json.NewDecoder(r.Body)
	defer r.Body.Close()
	if err := dec.Decode(&req); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	merged := models.MergeBrandingDefaults(req)
	raw, err := json.Marshal(merged)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "encode error")
		return
	}
	_, err = a.DB.Exec(`
		INSERT INTO store_branding (id, data_json) VALUES (1, ?)
		ON DUPLICATE KEY UPDATE data_json = VALUES(data_json)`, string(raw))
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	a.writeJSON(w, http.StatusOK, map[string]any{"branding": merged})
}
