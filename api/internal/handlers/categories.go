package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/alliraa/api/internal/models"
)

const categorySelectCols = `id, name, slug, type, parent_id, image_url, description, fabrics_json, prints_json, sort_order, is_active, created_at, updated_at`

func (a *API) scanCategory(scanner interface {
	Scan(dest ...any) error
}) (models.Category, error) {
	var c models.Category
	var parentID sql.NullInt64
	var imageURL, description, fabricsJSON, printsJSON sql.NullString
	var isActive int
	err := scanner.Scan(
		&c.ID, &c.Name, &c.Slug, &c.Type, &parentID, &imageURL, &description, &fabricsJSON, &printsJSON,
		&c.SortOrder, &isActive, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return c, err
	}
	c.ParentID = uintPtr(parentID)
	c.ImageURL = strPtr(imageURL)
	c.Description = strPtr(description)
	c.IsActive = isActive == 1
	c.Fabrics = parseFabricsJSON(fabricsJSON)
	c.Prints = parsePrintsJSON(printsJSON)
	return c, nil
}

func parseFabricsJSON(raw sql.NullString) []models.CategoryFabric {
	if !raw.Valid || strings.TrimSpace(raw.String) == "" || raw.String == "null" {
		return []models.CategoryFabric{}
	}
	var fabrics []models.CategoryFabric
	if err := json.Unmarshal([]byte(raw.String), &fabrics); err != nil || fabrics == nil {
		return []models.CategoryFabric{}
	}
	return fabrics
}

func parsePrintsJSON(raw sql.NullString) []models.CategoryPrint {
	if !raw.Valid || strings.TrimSpace(raw.String) == "" || raw.String == "null" {
		return []models.CategoryPrint{}
	}
	var prints []models.CategoryPrint
	if err := json.Unmarshal([]byte(raw.String), &prints); err != nil || prints == nil {
		return []models.CategoryPrint{}
	}
	return prints
}

func marshalFabrics(fabrics []models.CategoryFabric) any {
	if fabrics == nil {
		fabrics = []models.CategoryFabric{}
	}
	for i := range fabrics {
		fabrics[i].Name = strings.TrimSpace(fabrics[i].Name)
		fabrics[i].Image = strings.TrimSpace(fabrics[i].Image)
		if fabrics[i].ID == "" && fabrics[i].Name != "" {
			fabrics[i].ID = slugify(fabrics[i].Name)
		}
	}
	raw, err := json.Marshal(fabrics)
	if err != nil {
		return "[]"
	}
	return string(raw)
}

func marshalPrints(prints []models.CategoryPrint) any {
	if prints == nil {
		prints = []models.CategoryPrint{}
	}
	for i := range prints {
		prints[i].Name = strings.TrimSpace(prints[i].Name)
		prints[i].Image = strings.TrimSpace(prints[i].Image)
		if prints[i].ID == "" && prints[i].Name != "" {
			prints[i].ID = slugify(prints[i].Name)
		}
	}
	raw, err := json.Marshal(prints)
	if err != nil {
		return "[]"
	}
	return string(raw)
}

func (a *API) ListCategories(w http.ResponseWriter, r *http.Request) {
	rows, err := a.DB.Query(`
		SELECT ` + categorySelectCols + `
		FROM categories ORDER BY type ASC, sort_order ASC, name ASC`)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()

	var all []models.Category
	for rows.Next() {
		c, err := a.scanCategory(rows)
		if err != nil {
			a.writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		all = append(all, c)
	}
	if all == nil {
		all = []models.Category{}
	}

	flat := r.URL.Query().Get("flat") == "1"
	if flat {
		a.writeJSON(w, http.StatusOK, map[string]any{"categories": all, "count": len(all)})
		return
	}

	byID := map[uint64]*models.Category{}
	nodes := make([]models.Category, len(all))
	copy(nodes, all)
	for i := range nodes {
		nodes[i].Children = nil
		byID[nodes[i].ID] = &nodes[i]
	}
	var roots []models.Category
	for i := range nodes {
		n := byID[nodes[i].ID]
		if n.ParentID != nil {
			if parent, ok := byID[*n.ParentID]; ok {
				parent.Children = append(parent.Children, *n)
				continue
			}
		}
		roots = append(roots, *n)
	}
	// Refresh roots from byID so nested children are included
	roots = nil
	for i := range nodes {
		if nodes[i].ParentID == nil {
			roots = append(roots, *byID[nodes[i].ID])
		}
	}
	if roots == nil {
		roots = []models.Category{}
	}
	a.writeJSON(w, http.StatusOK, map[string]any{"categories": roots, "count": len(all)})
}

func (a *API) GetCategory(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	row := a.DB.QueryRow(`
		SELECT `+categorySelectCols+`
		FROM categories WHERE id = ?`, id)
	c, err := a.scanCategory(row)
	if err == sql.ErrNoRows {
		a.writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	a.writeJSON(w, http.StatusOK, c)
}

func (a *API) CreateCategory(w http.ResponseWriter, r *http.Request) {
	var in models.CategoryInput
	if err := a.decodeJSON(r, &in); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(in.Name) == "" {
		a.writeError(w, http.StatusBadRequest, "name required")
		return
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Name)
	} else {
		in.Slug = slugify(in.Slug)
	}
	if in.Type == "" {
		in.Type = "women"
	}
	sortOrder := 0
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}
	isActive := 1
	if in.IsActive != nil && !*in.IsActive {
		isActive = 0
	}
	res, err := a.DB.Exec(`
		INSERT INTO categories (name, slug, type, parent_id, image_url, description, fabrics_json, prints_json, sort_order, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		in.Name, in.Slug, strings.ToLower(in.Type), nullUint(in.ParentID), nullStr(in.ImageURL),
		nullStr(in.Description), marshalFabrics(in.Fabrics), marshalPrints(in.Prints), sortOrder, isActive)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	id, _ := res.LastInsertId()
	row := a.DB.QueryRow(`
		SELECT `+categorySelectCols+`
		FROM categories WHERE id = ?`, id)
	c, err := a.scanCategory(row)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	a.writeJSON(w, http.StatusCreated, c)
}

func (a *API) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var in models.CategoryInput
	if err := a.decodeJSON(r, &in); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Name)
	} else {
		in.Slug = slugify(in.Slug)
	}
	if in.Type == "" {
		in.Type = "women"
	}
	sortOrder := 0
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}
	isActive := 1
	if in.IsActive != nil && !*in.IsActive {
		isActive = 0
	}
	_, err = a.DB.Exec(`
		UPDATE categories SET name=?, slug=?, type=?, parent_id=?, image_url=?, description=?, fabrics_json=?, prints_json=?, sort_order=?, is_active=?
		WHERE id=?`,
		in.Name, in.Slug, strings.ToLower(in.Type), nullUint(in.ParentID), nullStr(in.ImageURL),
		nullStr(in.Description), marshalFabrics(in.Fabrics), marshalPrints(in.Prints), sortOrder, isActive, id)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	a.GetCategory(w, r)
}

func (a *API) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	_, err = a.DB.Exec(`DELETE FROM categories WHERE id = ?`, id)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	a.writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}
