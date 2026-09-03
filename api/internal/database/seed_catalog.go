package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/alliraa/api/internal/models"
)

const (
	imgTote    = "https://images.hostinger.com/bf8f6132-2617-4659-8733-71335300c422.png"
	imgPouch   = "https://images.hostinger.com/d04a43d9-643b-4fd8-9b37-abad8073e87c.png"
	imgLaptop  = "https://images.hostinger.com/27aa0499-5c4d-45c9-acfc-f3969656e8fc.png"
	imgTravel  = "https://images.hostinger.com/2a3c4564-00d6-4f75-9c69-a0bf5ace5596.png"
	imgFabrics = "https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png"
	imgNew     = "https://images.hostinger.com/9790ad75-b7ac-491c-bb1f-32caba50d944.png"
	imgHero    = "https://images.hostinger.com/f6d393c2-1e22-4a11-9e42-f239d3f81838.png"
	imgPromo   = "https://images.hostinger.com/ffeeb997-7801-4b5c-a995-77b4f488bdf3.png"
	imgLook    = "https://images.hostinger.com/32ffb92d-4dba-4ce2-a807-88d9c09f2578.png"
)

type seedCategory struct {
	Name        string
	Slug        string
	ImageURL    string
	Description string
	SortOrder   int
	Fabrics     []models.CategoryFabric
	Prints      []models.CategoryPrint
}

type seedProduct struct {
	Title       string
	Slug        string
	Subtitle    string
	Description string
	Category    string // child category slug
	Ribbon      string
	PriceCents  int
	Inventory   int
	Images      [4]string
}

func defaultFabrics(primaryImage string) []models.CategoryFabric {
	return []models.CategoryFabric{
		{ID: "canvas", Name: "Canvas", Image: primaryImage},
		{ID: "cotton", Name: "Cotton", Image: imgFabrics},
		{ID: "linen", Name: "Linen", Image: imgLook},
		{ID: "silk", Name: "Silk", Image: imgPromo},
	}
}

func defaultPrints() []models.CategoryPrint {
	return []models.CategoryPrint{
		{ID: "solid", Name: "Solid"},
		{ID: "floral", Name: "Floral"},
		{ID: "geo", Name: "Geo"},
		{ID: "stripe", Name: "Stripe"},
	}
}

// EnsureCatalogSeed inserts default Women hierarchy + products when missing (idempotent by slug).
func EnsureCatalogSeed(db *sql.DB) error {
	womenID, err := ensureCategory(db, seedCategory{
		Name:        "Women",
		Slug:        "women",
		ImageURL:    imgHero,
		Description: "Women's handmade textile collection",
		SortOrder:   0,
	}, nil)
	if err != nil {
		return fmt.Errorf("seed women: %w", err)
	}

	children := []seedCategory{
		{
			Name: "Tote Bags", Slug: "tote-bags", ImageURL: imgTote,
			Description: "Everyday canvas and structured totes", SortOrder: 1,
			Fabrics: []models.CategoryFabric{
				{ID: "canvas", Name: "Canvas", Image: imgTote},
				{ID: "cotton", Name: "Cotton", Image: imgFabrics},
				{ID: "jute", Name: "Jute", Image: imgLook},
			},
			Prints: defaultPrints(),
		},
		{
			Name: "Pouch Bags", Slug: "pouch-bags", ImageURL: imgPouch,
			Description: "Compact pouches for essentials", SortOrder: 2,
			Fabrics: []models.CategoryFabric{
				{ID: "cotton", Name: "Cotton", Image: imgPouch},
				{ID: "silk", Name: "Silk", Image: imgPromo},
				{ID: "linen", Name: "Linen", Image: imgLook},
			},
			Prints: defaultPrints(),
		},
		{
			Name: "Laptop Bags", Slug: "laptop-bags", ImageURL: imgLaptop,
			Description: "Minimal laptop sleeves and carriers", SortOrder: 3,
			Fabrics: []models.CategoryFabric{
				{ID: "canvas", Name: "Canvas", Image: imgLaptop},
				{ID: "nylon", Name: "Nylon", Image: imgTravel},
				{ID: "leather", Name: "Leather Accent", Image: imgNew},
			},
			Prints: defaultPrints(),
		},
		{
			Name: "Travel Bags", Slug: "travel-bags", ImageURL: imgTravel,
			Description: "Weekenders and travel duffels", SortOrder: 4,
			Fabrics: []models.CategoryFabric{
				{ID: "canvas", Name: "Canvas", Image: imgTravel},
				{ID: "cotton", Name: "Cotton", Image: imgTote},
				{ID: "waxed", Name: "Waxed Canvas", Image: imgHero},
			},
			Prints: defaultPrints(),
		},
		{
			Name: "Printed Fabrics", Slug: "printed-fabrics", ImageURL: imgFabrics,
			Description: "Artisan printed textile fabrics", SortOrder: 5,
			Fabrics: []models.CategoryFabric{
				{ID: "cotton", Name: "Cotton", Image: imgFabrics},
				{ID: "silk", Name: "Silk", Image: imgPromo},
				{ID: "linen", Name: "Linen", Image: imgLook},
				{ID: "khadi", Name: "Khadi", Image: imgHero},
			},
			Prints: []models.CategoryPrint{
				{ID: "solid", Name: "Solid"},
				{ID: "floral", Name: "Floral"},
				{ID: "geo", Name: "Geo"},
				{ID: "stripe", Name: "Stripe"},
				{ID: "botanical", Name: "Botanical"},
			},
		},
		{
			Name: "New Arrivals", Slug: "new-arrivals", ImageURL: imgNew,
			Description: "Latest pieces from the atelier", SortOrder: 6,
			Fabrics: defaultFabrics(imgNew),
			Prints:  defaultPrints(),
		},
	}

	categoryIDs := map[string]uint64{}
	for _, c := range children {
		id, err := ensureCategory(db, c, &womenID)
		if err != nil {
			return fmt.Errorf("seed category %s: %w", c.Slug, err)
		}
		categoryIDs[c.Slug] = id
	}

	products := []seedProduct{
		{
			Title: "Essential Canvas Tote", Slug: "essential-canvas-tote", Category: "tote-bags",
			Subtitle: "Everyday carry", Description: "Spacious off-white canvas tote with clean lines for daily errands.",
			Ribbon: "Bestseller", PriceCents: 5999, Inventory: 40,
			Images: [4]string{imgTote, imgPouch, imgLook, imgHero},
		},
		{
			Title: "Structured Market Tote", Slug: "structured-market-tote", Category: "tote-bags",
			Subtitle: "Weekend favorite", Description: "Reinforced handles and a roomy interior for market runs and travel days.",
			Ribbon: "New", PriceCents: 7499, Inventory: 28,
			Images: [4]string{imgNew, imgTote, imgPromo, imgLaptop},
		},
		{
			Title: "Floral Drawstring Pouch", Slug: "floral-drawstring-pouch", Category: "pouch-bags",
			Subtitle: "Hand embroidered", Description: "Soft pouch with red and yellow floral embroidery — perfect for small essentials.",
			Ribbon: "Handmade", PriceCents: 3499, Inventory: 55,
			Images: [4]string{imgPouch, imgFabrics, imgTote, imgLook},
		},
		{
			Title: "Minimal Zip Pouch", Slug: "minimal-zip-pouch", Category: "pouch-bags",
			Subtitle: "Travel companion", Description: "Clean zipper pouch in natural cotton canvas for cosmetics or cables.",
			PriceCents: 2999, Inventory: 60,
			Images: [4]string{imgPouch, imgLaptop, imgHero, imgPromo},
		},
		{
			Title: "Slim Laptop Sleeve", Slug: "slim-laptop-sleeve", Category: "laptop-bags",
			Subtitle: "13–15 inch", Description: "Padded minimalist sleeve with soft handles to protect your laptop in style.",
			Ribbon: "New", PriceCents: 6999, Inventory: 35,
			Images: [4]string{imgLaptop, imgTote, imgTravel, imgLook},
		},
		{
			Title: "Workday Laptop Tote", Slug: "workday-laptop-tote", Category: "laptop-bags",
			Subtitle: "Office ready", Description: "Structured laptop tote with an interior sleeve and leather-accent straps.",
			PriceCents: 8999, Inventory: 22,
			Images: [4]string{imgLaptop, imgNew, imgHero, imgPromo},
		},
		{
			Title: "Weekender Duffel", Slug: "weekender-duffel", Category: "travel-bags",
			Subtitle: "Short getaways", Description: "Roomy off-white and tan duffel with leather straps for overnight trips.",
			Ribbon: "Bestseller", PriceCents: 12999, Inventory: 18,
			Images: [4]string{imgTravel, imgNew, imgTote, imgLook},
		},
		{
			Title: "Cabin Carryall", Slug: "cabin-carryall", Category: "travel-bags",
			Subtitle: "Soft-sided", Description: "Soft travel bag that folds flat when empty — ideal for cabin packing.",
			PriceCents: 10999, Inventory: 20,
			Images: [4]string{imgTravel, imgLaptop, imgPromo, imgHero},
		},
		{
			Title: "Heritage Print Bundle", Slug: "heritage-print-bundle", Category: "printed-fabrics",
			Subtitle: "Yardage set", Description: "A curated stack of printed fabrics in warm reds, browns, and ivory.",
			Ribbon: "Limited", PriceCents: 4599, Inventory: 80,
			Images: [4]string{imgFabrics, imgPouch, imgLook, imgPromo},
		},
		{
			Title: "Botanical Cotton Print", Slug: "botanical-cotton-print", Category: "printed-fabrics",
			Subtitle: "By the metre", Description: "Soft cotton with artisan botanical motifs — ready for sewing projects.",
			PriceCents: 2499, Inventory: 120,
			Images: [4]string{imgFabrics, imgHero, imgTote, imgNew},
		},
		{
			Title: "Atelier Structured Bag", Slug: "atelier-structured-bag", Category: "new-arrivals",
			Subtitle: "Just in", Description: "Newly arrived structured handbag in light tan with clean geometry.",
			Ribbon: "New", PriceCents: 9999, Inventory: 15,
			Images: [4]string{imgNew, imgTravel, imgLook, imgLaptop},
		},
		{
			Title: "Seasonal Canvas Edit", Slug: "seasonal-canvas-edit", Category: "new-arrivals",
			Subtitle: "Limited drop", Description: "A fresh canvas silhouette from this season's collection.",
			Ribbon: "New", PriceCents: 8499, Inventory: 25,
			Images: [4]string{imgNew, imgTote, imgPromo, imgFabrics},
		},
	}

	for _, p := range products {
		catID, ok := categoryIDs[p.Category]
		if !ok {
			return fmt.Errorf("missing category for product %s", p.Slug)
		}
		if err := ensureProduct(db, p, catID); err != nil {
			return fmt.Errorf("seed product %s: %w", p.Slug, err)
		}
	}
	return nil
}

func fabricsJSON(fabrics []models.CategoryFabric) string {
	if fabrics == nil {
		fabrics = []models.CategoryFabric{}
	}
	raw, err := json.Marshal(fabrics)
	if err != nil {
		return "[]"
	}
	return string(raw)
}

func printsJSON(prints []models.CategoryPrint) string {
	if prints == nil {
		prints = []models.CategoryPrint{}
	}
	raw, err := json.Marshal(prints)
	if err != nil {
		return "[]"
	}
	return string(raw)
}

func ensureCategory(db *sql.DB, c seedCategory, parentID *uint64) (uint64, error) {
	var id uint64
	err := db.QueryRow(
		`SELECT id FROM categories WHERE type=? AND slug=? LIMIT 1`,
		"women", c.Slug,
	).Scan(&id)
	if err == nil {
		// Keep existing row; refresh image/parent if empty or parent missing.
		// Seed fabrics/prints only when the column is null/empty so admin edits are preserved.
		_, _ = db.Exec(`
			UPDATE categories
			SET image_url = COALESCE(NULLIF(image_url, ''), ?),
			    parent_id = COALESCE(parent_id, ?),
			    description = COALESCE(NULLIF(description, ''), ?),
			    fabrics_json = CASE
			      WHEN fabrics_json IS NULL OR fabrics_json = CAST('null' AS JSON) OR JSON_LENGTH(fabrics_json) = 0
			      THEN CAST(? AS JSON)
			      ELSE fabrics_json
			    END,
			    prints_json = CASE
			      WHEN prints_json IS NULL OR prints_json = CAST('null' AS JSON) OR JSON_LENGTH(prints_json) = 0
			      THEN CAST(? AS JSON)
			      ELSE prints_json
			    END,
			    sort_order = ?,
			    is_active = 1
			WHERE id=?`,
			c.ImageURL, parentID, c.Description, fabricsJSON(c.Fabrics), printsJSON(c.Prints), c.SortOrder, id,
		)
		return id, nil
	}
	if err != sql.ErrNoRows {
		return 0, err
	}

	res, err := db.Exec(`
		INSERT INTO categories (name, slug, type, parent_id, image_url, description, fabrics_json, prints_json, sort_order, is_active)
		VALUES (?, ?, 'women', ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), ?, 1)`,
		c.Name, c.Slug, parentID, c.ImageURL, c.Description, fabricsJSON(c.Fabrics), printsJSON(c.Prints), c.SortOrder,
	)
	if err != nil {
		return 0, err
	}
	newID, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}
	return uint64(newID), nil
}

func ensureProduct(db *sql.DB, p seedProduct, categoryID uint64) error {
	var id uint64
	err := db.QueryRow(`SELECT id FROM products WHERE slug=? LIMIT 1`, p.Slug).Scan(&id)
	if err == nil {
		return nil
	}
	if err != sql.ErrNoRows {
		return err
	}

	thumb := p.Images[0]
	var ribbon any
	if p.Ribbon != "" {
		ribbon = p.Ribbon
	}
	res, err := db.Exec(`
		INSERT INTO products (title, slug, subtitle, description, thumbnail, category_id, ribbon_text, status, purchasable, sort_order)
		VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 1, 0)`,
		p.Title, p.Slug, p.Subtitle, p.Description, thumb, categoryID, ribbon,
	)
	if err != nil {
		return err
	}
	productID, err := res.LastInsertId()
	if err != nil {
		return err
	}

	for i, url := range p.Images {
		if _, err := db.Exec(
			`INSERT INTO product_images (product_id, url, sort_order) VALUES (?, ?, ?)`,
			productID, url, i,
		); err != nil {
			return err
		}
	}

	varRes, err := db.Exec(`
		INSERT INTO product_variants (product_id, title, sku, price_cents, currency, image_url, inventory_quantity, manage_inventory, sort_order)
		VALUES (?, 'Default', ?, ?, 'usd', ?, ?, 1, 0)`,
		productID, p.Slug+"-default", p.PriceCents, thumb, p.Inventory,
	)
	if err != nil {
		return err
	}
	variantID, err := varRes.LastInsertId()
	if err != nil {
		return err
	}

	for i, url := range p.Images {
		if _, err := db.Exec(
			`INSERT INTO variant_images (variant_id, url, sort_order) VALUES (?, ?, ?)`,
			variantID, url, i,
		); err != nil {
			return err
		}
	}
	return nil
}
