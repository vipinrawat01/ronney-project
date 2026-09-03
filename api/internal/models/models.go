package models

import "time"

type Admin struct {
	ID           uint64    `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Name         string    `json:"name"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CategoryFabric struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

type CategoryPrint struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

type Category struct {
	ID          uint64           `json:"id"`
	Name        string           `json:"name"`
	Slug        string           `json:"slug"`
	Type        string           `json:"type"`
	ParentID    *uint64          `json:"parent_id"`
	ImageURL    *string          `json:"image_url"`
	Description *string          `json:"description"`
	Fabrics     []CategoryFabric `json:"fabrics"`
	Prints      []CategoryPrint  `json:"prints"`
	SortOrder   int              `json:"sort_order"`
	IsActive    bool             `json:"is_active"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Children    []Category       `json:"children,omitempty"`
	ParentName  *string          `json:"parent_name,omitempty"`
}

type ProductImage struct {
	ID        uint64 `json:"id"`
	ProductID uint64 `json:"product_id"`
	URL       string `json:"url"`
	SortOrder int    `json:"sort_order"`
}

type VariantImage struct {
	ID        uint64 `json:"id"`
	VariantID uint64 `json:"variant_id"`
	URL       string `json:"url"`
	SortOrder int    `json:"sort_order"`
}

type ProductVariant struct {
	ID                uint64         `json:"id"`
	ProductID         uint64         `json:"product_id"`
	Title             string         `json:"title"`
	SKU               *string        `json:"sku"`
	PriceCents        int            `json:"price_cents"`
	SalePriceCents    *int           `json:"sale_price_cents"`
	Currency          string         `json:"currency"`
	ImageURL          *string        `json:"image_url"`
	InventoryQuantity int            `json:"inventory_quantity"`
	ManageInventory   bool           `json:"manage_inventory"`
	Weight            *float64       `json:"weight"`
	OptionsJSON       *string        `json:"options_json,omitempty"`
	SortOrder         int            `json:"sort_order"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	Images            []VariantImage `json:"images,omitempty"`

	// Storefront-compatible aliases
	PriceInCents       int     `json:"price_in_cents"`
	SalePriceInCents   *int    `json:"sale_price_in_cents"`
	PriceFormatted     string  `json:"price_formatted,omitempty"`
	SalePriceFormatted *string `json:"sale_price_formatted,omitempty"`
}

type Product struct {
	ID          uint64           `json:"id"`
	Title       string           `json:"title"`
	Slug        string           `json:"slug"`
	Subtitle    *string          `json:"subtitle"`
	Description *string          `json:"description"`
	Thumbnail   *string          `json:"thumbnail"`
	CategoryID  *uint64          `json:"category_id"`
	RibbonText  *string          `json:"ribbon_text"`
	Status      string           `json:"status"`
	Purchasable bool             `json:"purchasable"`
	SortOrder   int              `json:"sort_order"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	Images      []ProductImage   `json:"images,omitempty"`
	Variants    []ProductVariant `json:"variants,omitempty"`
	Category    *Category        `json:"category,omitempty"`

	// Storefront-compatible fields
	Name         string  `json:"name,omitempty"`
	Image        *string `json:"image,omitempty"`
	PriceInCents int     `json:"price_in_cents,omitempty"`
	Currency     string  `json:"currency,omitempty"`
	Order        int     `json:"order,omitempty"`
}

type CategoryInput struct {
	Name        string           `json:"name"`
	Slug        string           `json:"slug"`
	Type        string           `json:"type"`
	ParentID    *uint64          `json:"parent_id"`
	ImageURL    *string          `json:"image_url"`
	Description *string          `json:"description"`
	Fabrics     []CategoryFabric `json:"fabrics"`
	Prints      []CategoryPrint  `json:"prints"`
	SortOrder   *int             `json:"sort_order"`
	IsActive    *bool            `json:"is_active"`
}

type VariantInput struct {
	ID                *uint64  `json:"id"`
	Title             string   `json:"title"`
	SKU               *string  `json:"sku"`
	PriceCents        int      `json:"price_cents"`
	SalePriceCents    *int     `json:"sale_price_cents"`
	Currency          string   `json:"currency"`
	ImageURL          *string  `json:"image_url"`
	InventoryQuantity int      `json:"inventory_quantity"`
	ManageInventory   *bool    `json:"manage_inventory"`
	Weight            *float64 `json:"weight"`
	OptionsJSON       *string  `json:"options_json"`
	SortOrder         int      `json:"sort_order"`
	Images            []string `json:"images"`
}

type ProductInput struct {
	Title       string         `json:"title"`
	Slug        string         `json:"slug"`
	Subtitle    *string        `json:"subtitle"`
	Description *string        `json:"description"`
	Thumbnail   *string        `json:"thumbnail"`
	CategoryID  *uint64        `json:"category_id"`
	RibbonText  *string        `json:"ribbon_text"`
	Status      string         `json:"status"`
	Purchasable *bool          `json:"purchasable"`
	SortOrder   *int           `json:"sort_order"`
	Images      []string       `json:"images"`
	Variants    []VariantInput `json:"variants"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	Admin Admin  `json:"admin"`
}
