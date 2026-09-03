package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"strings"

	"github.com/alliraa/api/internal/models"
)

func (a *API) loadProductImages(productID uint64) ([]models.ProductImage, error) {
	rows, err := a.DB.Query(`SELECT id, product_id, url, sort_order FROM product_images WHERE product_id=? ORDER BY sort_order, id`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var images []models.ProductImage
	for rows.Next() {
		var img models.ProductImage
		if err := rows.Scan(&img.ID, &img.ProductID, &img.URL, &img.SortOrder); err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	return images, nil
}

func (a *API) loadVariantImages(variantID uint64) ([]models.VariantImage, error) {
	rows, err := a.DB.Query(`SELECT id, variant_id, url, sort_order FROM variant_images WHERE variant_id=? ORDER BY sort_order, id`, variantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var images []models.VariantImage
	for rows.Next() {
		var img models.VariantImage
		if err := rows.Scan(&img.ID, &img.VariantID, &img.URL, &img.SortOrder); err != nil {
			return nil, err
		}
		images = append(images, img)
	}
	return images, nil
}

func (a *API) loadVariants(productID uint64) ([]models.ProductVariant, error) {
	rows, err := a.DB.Query(`
		SELECT id, product_id, title, sku, price_cents, sale_price_cents, currency, image_url,
		       inventory_quantity, manage_inventory, weight, options_json, sort_order, created_at, updated_at
		FROM product_variants WHERE product_id=? ORDER BY sort_order, id`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var variants []models.ProductVariant
	for rows.Next() {
		var v models.ProductVariant
		var sku, imageURL, optionsJSON sql.NullString
		var salePrice sql.NullInt64
		var weight sql.NullFloat64
		var manageInv int
		if err := rows.Scan(
			&v.ID, &v.ProductID, &v.Title, &sku, &v.PriceCents, &salePrice, &v.Currency, &imageURL,
			&v.InventoryQuantity, &manageInv, &weight, &optionsJSON, &v.SortOrder, &v.CreatedAt, &v.UpdatedAt,
		); err != nil {
			return nil, err
		}
		v.SKU = strPtr(sku)
		v.ImageURL = strPtr(imageURL)
		v.SalePriceCents = intPtr(salePrice)
		v.Weight = floatPtr(weight)
		v.OptionsJSON = strPtr(optionsJSON)
		v.ManageInventory = manageInv == 1
		v.PriceInCents = v.PriceCents
		v.SalePriceInCents = v.SalePriceCents
		v.PriceFormatted = formatMoney(v.PriceCents, v.Currency)
		if v.SalePriceCents != nil {
			f := formatMoney(*v.SalePriceCents, v.Currency)
			v.SalePriceFormatted = &f
		}
		imgs, err := a.loadVariantImages(v.ID)
		if err != nil {
			return nil, err
		}
		v.Images = imgs
		variants = append(variants, v)
	}
	return variants, nil
}

func (a *API) hydrateProduct(p *models.Product) error {
	imgs, err := a.loadProductImages(p.ID)
	if err != nil {
		return err
	}
	p.Images = imgs
	variants, err := a.loadVariants(p.ID)
	if err != nil {
		return err
	}
	p.Variants = variants
	p.Name = p.Title
	p.Image = p.Thumbnail
	p.Order = p.SortOrder
	if len(variants) > 0 {
		p.PriceInCents = variants[0].PriceCents
		p.Currency = variants[0].Currency
		for _, v := range variants {
			price := v.PriceCents
			if v.SalePriceCents != nil {
				price = *v.SalePriceCents
			}
			cur := p.PriceInCents
			if variants[0].SalePriceCents != nil {
				cur = *variants[0].SalePriceCents
			}
			if price < cur {
				p.PriceInCents = price
				p.Currency = v.Currency
			}
		}
	}
	if p.CategoryID != nil {
		row := a.DB.QueryRow(`
			SELECT id, name, slug, type, parent_id, image_url, description, fabrics_json, prints_json, sort_order, is_active, created_at, updated_at
			FROM categories WHERE id=?`, *p.CategoryID)
		if c, err := a.scanCategory(row); err == nil {
			p.Category = &c
		}
	}
	return nil
}

func (a *API) scanProduct(scanner interface {
	Scan(dest ...any) error
}) (models.Product, error) {
	var p models.Product
	var subtitle, description, thumbnail, ribbon sql.NullString
	var categoryID sql.NullInt64
	var purchasable int
	err := scanner.Scan(
		&p.ID, &p.Title, &p.Slug, &subtitle, &description, &thumbnail, &categoryID,
		&ribbon, &p.Status, &purchasable, &p.SortOrder, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return p, err
	}
	p.Subtitle = strPtr(subtitle)
	p.Description = strPtr(description)
	p.Thumbnail = strPtr(thumbnail)
	p.RibbonText = strPtr(ribbon)
	p.CategoryID = uintPtr(categoryID)
	p.Purchasable = purchasable == 1
	return p, nil
}

func (a *API) ListProducts(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit, _ := strconv.Atoi(q.Get("limit"))
	offset, _ := strconv.Atoi(q.Get("offset"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	where := []string{"1=1"}
	args := []any{}
	if cat := q.Get("category_id"); cat != "" {
		where = append(where, "category_id = ?")
		args = append(args, cat)
	}
	if status := q.Get("status"); status != "" {
		where = append(where, "status = ?")
		args = append(args, status)
	}
	if search := strings.TrimSpace(q.Get("q")); search != "" {
		where = append(where, "(title LIKE ? OR slug LIKE ?)")
		like := "%" + search + "%"
		args = append(args, like, like)
	}
	if typ := q.Get("type"); typ != "" {
		where = append(where, `category_id IN (SELECT id FROM categories WHERE type = ? OR parent_id IN (SELECT id FROM categories WHERE type = ?))`)
		args = append(args, strings.ToLower(typ), strings.ToLower(typ))
	}
	if sub := q.Get("subcategory"); sub != "" {
		where = append(where, `category_id IN (SELECT id FROM categories WHERE slug = ? OR name LIKE ?)`)
		args = append(args, slugify(sub), "%"+sub+"%")
	}

	whereSQL := strings.Join(where, " AND ")
	var count int
	countArgs := append([]any{}, args...)
	if err := a.DB.QueryRow(`SELECT COUNT(*) FROM products WHERE `+whereSQL, countArgs...).Scan(&count); err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}

	args = append(args, limit, offset)
	rows, err := a.DB.Query(`
		SELECT id, title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order, created_at, updated_at
		FROM products WHERE `+whereSQL+` ORDER BY sort_order ASC, id DESC LIMIT ? OFFSET ?`, args...)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		p, err := a.scanProduct(rows)
		if err != nil {
			a.writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		if err := a.hydrateProduct(&p); err != nil {
			a.writeError(w, http.StatusInternalServerError, "hydrate error")
			return
		}
		products = append(products, p)
	}
	if products == nil {
		products = []models.Product{}
	}
	a.writeJSON(w, http.StatusOK, map[string]any{
		"products": products,
		"count":    count,
		"limit":    limit,
		"offset":   offset,
	})
}

func (a *API) GetProduct(w http.ResponseWriter, r *http.Request) {
	idStr := pathID(r)
	var p models.Product
	var err error
	if id, parseErr := strconv.ParseUint(idStr, 10, 64); parseErr == nil {
		row := a.DB.QueryRow(`
			SELECT id, title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order, created_at, updated_at
			FROM products WHERE id=?`, id)
		p, err = a.scanProduct(row)
	} else {
		row := a.DB.QueryRow(`
			SELECT id, title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order, created_at, updated_at
			FROM products WHERE slug=?`, idStr)
		p, err = a.scanProduct(row)
	}
	if err == sql.ErrNoRows {
		a.writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if err := a.hydrateProduct(&p); err != nil {
		a.writeError(w, http.StatusInternalServerError, "hydrate error")
		return
	}
	a.writeJSON(w, http.StatusOK, map[string]any{"product": p})
}

func (a *API) replaceProductImages(tx *sql.Tx, productID uint64, urls []string) error {
	if _, err := tx.Exec(`DELETE FROM product_images WHERE product_id=?`, productID); err != nil {
		return err
	}
	for i, url := range urls {
		url = strings.TrimSpace(url)
		if url == "" {
			continue
		}
		if _, err := tx.Exec(`INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)`, productID, url, i); err != nil {
			return err
		}
	}
	return nil
}

func (a *API) replaceVariants(tx *sql.Tx, productID uint64, variants []models.VariantInput) error {
	if _, err := tx.Exec(`DELETE FROM product_variants WHERE product_id=?`, productID); err != nil {
		return err
	}
	for i, v := range variants {
		if strings.TrimSpace(v.Title) == "" {
			continue
		}
		currency := v.Currency
		if currency == "" {
			currency = "usd"
		}
		manageInv := 1
		if v.ManageInventory != nil && !*v.ManageInventory {
			manageInv = 0
		}
		sortOrder := v.SortOrder
		if sortOrder == 0 {
			sortOrder = i
		}
		res, err := tx.Exec(`
			INSERT INTO product_variants
			(product_id, title, sku, price_cents, sale_price_cents, currency, image_url, inventory_quantity, manage_inventory, weight, options_json, sort_order)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			productID, v.Title, nullStr(v.SKU), v.PriceCents, nullInt(v.SalePriceCents), currency,
			nullStr(v.ImageURL), v.InventoryQuantity, manageInv, nullFloat(v.Weight), nullStr(v.OptionsJSON), sortOrder)
		if err != nil {
			return err
		}
		vid, _ := res.LastInsertId()
		images := v.Images
		if len(images) == 0 && v.ImageURL != nil && *v.ImageURL != "" {
			images = []string{*v.ImageURL}
		}
		for j, url := range images {
			url = strings.TrimSpace(url)
			if url == "" {
				continue
			}
			if _, err := tx.Exec(`INSERT INTO variant_images (variant_id, url, sort_order) VALUES (?, ?, ?)`, vid, url, j); err != nil {
				return err
			}
		}
	}
	return nil
}

func (a *API) CreateProduct(w http.ResponseWriter, r *http.Request) {
	var in models.ProductInput
	if err := a.decodeJSON(r, &in); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if strings.TrimSpace(in.Title) == "" {
		a.writeError(w, http.StatusBadRequest, "title required")
		return
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Title)
	} else {
		in.Slug = slugify(in.Slug)
	}
	if in.Status == "" {
		in.Status = "active"
	}
	purchasable := 1
	if in.Purchasable != nil && !*in.Purchasable {
		purchasable = 0
	}
	sortOrder := 0
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}

	tx, err := a.DB.Begin()
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "tx error")
		return
	}
	defer tx.Rollback()

	res, err := tx.Exec(`
		INSERT INTO products (title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		in.Title, in.Slug, nullStr(in.Subtitle), nullStr(in.Description), nullStr(in.Thumbnail),
		nullUint(in.CategoryID), nullStr(in.RibbonText), in.Status, purchasable, sortOrder)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	pid, _ := res.LastInsertId()
	if err := a.replaceProductImages(tx, uint64(pid), in.Images); err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := a.replaceVariants(tx, uint64(pid), in.Variants); err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := tx.Commit(); err != nil {
		a.writeError(w, http.StatusInternalServerError, "commit error")
		return
	}
	row := a.DB.QueryRow(`
		SELECT id, title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order, created_at, updated_at
		FROM products WHERE id=?`, pid)
	p, err := a.scanProduct(row)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	if err := a.hydrateProduct(&p); err != nil {
		a.writeError(w, http.StatusInternalServerError, "hydrate error")
		return
	}
	a.writeJSON(w, http.StatusCreated, map[string]any{"product": p})
}

func (a *API) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var in models.ProductInput
	if err := a.decodeJSON(r, &in); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid json")
		return
	}
	if in.Slug == "" {
		in.Slug = slugify(in.Title)
	} else {
		in.Slug = slugify(in.Slug)
	}
	if in.Status == "" {
		in.Status = "active"
	}
	purchasable := 1
	if in.Purchasable != nil && !*in.Purchasable {
		purchasable = 0
	}
	sortOrder := 0
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}

	tx, err := a.DB.Begin()
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "tx error")
		return
	}
	defer tx.Rollback()

	res, err := tx.Exec(`
		UPDATE products SET title=?, slug=?, subtitle=?, description=?, thumbnail=?, category_id=?, ribbon_text=?, status=?, purchasable=?, sort_order=?
		WHERE id=?`,
		in.Title, in.Slug, nullStr(in.Subtitle), nullStr(in.Description), nullStr(in.Thumbnail),
		nullUint(in.CategoryID), nullStr(in.RibbonText), in.Status, purchasable, sortOrder, id)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		a.writeError(w, http.StatusNotFound, "not found")
		return
	}
	if err := a.replaceProductImages(tx, id, in.Images); err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if in.Variants != nil {
		if err := a.replaceVariants(tx, id, in.Variants); err != nil {
			a.writeError(w, http.StatusBadRequest, err.Error())
			return
		}
	}
	if err := tx.Commit(); err != nil {
		a.writeError(w, http.StatusInternalServerError, "commit error")
		return
	}
	a.GetProduct(w, r)
}

func (a *API) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	res, err := a.DB.Exec(`DELETE FROM products WHERE id=?`, id)
	if err != nil {
		a.writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		a.writeError(w, http.StatusNotFound, "not found")
		return
	}
	a.writeJSON(w, http.StatusOK, map[string]string{"status": "deleted"})
}

func (a *API) ListVariantInventory(w http.ResponseWriter, r *http.Request) {
	ids := r.URL.Query()["product_ids[]"]
	if len(ids) == 0 {
		if single := r.URL.Query().Get("product_ids"); single != "" {
			ids = strings.Split(single, ",")
		}
	}
	if len(ids) == 0 {
		a.writeJSON(w, http.StatusOK, map[string]any{"variants": []any{}})
		return
	}
	placeholders := make([]string, len(ids))
	args := make([]any, len(ids))
	for i, id := range ids {
		placeholders[i] = "?"
		args[i] = id
	}
	rows, err := a.DB.Query(`SELECT id, inventory_quantity FROM product_variants WHERE product_id IN (`+strings.Join(placeholders, ",")+`)`, args...)
	if err != nil {
		a.writeError(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	type inv struct {
		ID                uint64 `json:"id"`
		InventoryQuantity int    `json:"inventory_quantity"`
	}
	var out []inv
	for rows.Next() {
		var v inv
		if err := rows.Scan(&v.ID, &v.InventoryQuantity); err != nil {
			a.writeError(w, http.StatusInternalServerError, "scan error")
			return
		}
		out = append(out, v)
	}
	if out == nil {
		out = []inv{}
	}
	a.writeJSON(w, http.StatusOK, map[string]any{"variants": out})
}
