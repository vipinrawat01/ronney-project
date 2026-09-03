package models

type BrandingColors struct {
	Primary    string `json:"primary"`
	Secondary  string `json:"secondary"`
	Background string `json:"background"`
	Foreground string `json:"foreground"`
}

type BrandingFonts struct {
	Heading string `json:"heading"`
	Body    string `json:"body"`
	Accent  string `json:"accent"`
}

type BrandingHero struct {
	ImageURL string `json:"image_url"`
	Badge    string `json:"badge"`
	Title    string `json:"title"`
	Subtitle string `json:"subtitle"`
}

type PromoBanner struct {
	Badge string `json:"badge"`
	Title string `json:"title"`
	Sub   string `json:"sub"`
	Cta   string `json:"cta"`
	Link  string `json:"link"`
	Image string `json:"image"`
}

type BrandStoryContent struct {
	ImageURL   string `json:"image_url"`
	Title      string `json:"title"`
	Paragraph1 string `json:"paragraph_1"`
	Paragraph2 string `json:"paragraph_2"`
}

type Branding struct {
	StoreName        string            `json:"store_name"`
	LogoURL          string            `json:"logo_url"`
	Colors           BrandingColors    `json:"colors"`
	Fonts            BrandingFonts     `json:"fonts"`
	Hero             BrandingHero      `json:"hero"`
	PromoBanners     []PromoBanner     `json:"promo_banners"`
	BrandStory       BrandStoryContent `json:"brand_story"`
	Manifesto        string            `json:"manifesto"`
	ShowPromoBanners *bool             `json:"show_promo_banners"`
	ShowBrandStory   *bool             `json:"show_brand_story"`
	ShowManifesto    *bool             `json:"show_manifesto"`
}

func boolPtr(v bool) *bool { return &v }

func DefaultBranding() Branding {
	return Branding{
		StoreName: "Alliraa Textile",
		LogoURL:   "",
		Colors: BrandingColors{
			Primary:    "#B89043",
			Secondary:  "#1A1A1A",
			Background: "#FAF8F5",
			Foreground: "#1F1F1F",
		},
		Fonts: BrandingFonts{
			Heading: "Playfair Display",
			Body:    "Manrope",
			Accent:  "Cormorant Garamond",
		},
		Hero: BrandingHero{
			ImageURL: "https://images.hostinger.com/f6d393c2-1e22-4a11-9e42-f239d3f81838.png",
			Badge:    "New Collection 2026",
			Title:    "Luxury Handmade Textile Collection",
			Subtitle: "Premium cotton bags & textile products crafted in India for worldwide buyers.",
		},
		PromoBanners: []PromoBanner{
			{
				Badge: "Summer Sale",
				Title: "Up to 50% Off",
				Sub:   "On selected items",
				Cta:   "Shop Now",
				Link:  "/shop",
				Image: "https://images.hostinger.com/ffeeb997-7801-4b5c-a995-77b4f488bdf3.png",
			},
			{
				Badge: "New Arrivals",
				Title: "Discover The Latest Trends",
				Sub:   "",
				Cta:   "Explore Now",
				Link:  "/shop",
				Image: "https://images.hostinger.com/32ffb92d-4dba-4ce2-a807-88d9c09f2578.png",
			},
		},
		BrandStory: BrandStoryContent{
			ImageURL:   "https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png",
			Title:      "A commitment to quiet luxury.",
			Paragraph1: "Alliraa Textile was born from a desire to return to the fundamentals of garment making. We believe that clothing should serve as a foundation—beautiful, enduring, and carefully considered.",
			Paragraph2: "By sourcing the finest natural fibers and partnering with specialized artisans, we craft pieces that respect both the wearer and the environment. Our designs reject seasonal urgency in favor of timeless utility.",
		},
		Manifesto:        "Handcrafted in India · Natural fibers · Timeless design for the world",
		ShowPromoBanners: boolPtr(true),
		ShowBrandStory:   boolPtr(true),
		ShowManifesto:    boolPtr(true),
	}
}

func MergeBrandingDefaults(b Branding) Branding {
	d := DefaultBranding()
	if b.StoreName == "" {
		b.StoreName = d.StoreName
	}
	if b.Colors.Primary == "" {
		b.Colors.Primary = d.Colors.Primary
	}
	if b.Colors.Secondary == "" {
		b.Colors.Secondary = d.Colors.Secondary
	}
	if b.Colors.Background == "" {
		b.Colors.Background = d.Colors.Background
	}
	if b.Colors.Foreground == "" {
		b.Colors.Foreground = d.Colors.Foreground
	}
	if b.Fonts.Heading == "" {
		b.Fonts.Heading = d.Fonts.Heading
	}
	if b.Fonts.Body == "" {
		b.Fonts.Body = d.Fonts.Body
	}
	if b.Fonts.Accent == "" {
		b.Fonts.Accent = d.Fonts.Accent
	}
	if b.Hero.ImageURL == "" {
		b.Hero.ImageURL = d.Hero.ImageURL
	}
	if b.Hero.Badge == "" {
		b.Hero.Badge = d.Hero.Badge
	}
	if b.Hero.Title == "" {
		b.Hero.Title = d.Hero.Title
	}
	if b.Hero.Subtitle == "" {
		b.Hero.Subtitle = d.Hero.Subtitle
	}
	if b.PromoBanners == nil {
		b.PromoBanners = d.PromoBanners
	}
	if b.BrandStory.ImageURL == "" {
		b.BrandStory.ImageURL = d.BrandStory.ImageURL
	}
	if b.BrandStory.Title == "" {
		b.BrandStory.Title = d.BrandStory.Title
	}
	if b.BrandStory.Paragraph1 == "" {
		b.BrandStory.Paragraph1 = d.BrandStory.Paragraph1
	}
	if b.BrandStory.Paragraph2 == "" {
		b.BrandStory.Paragraph2 = d.BrandStory.Paragraph2
	}
	if b.Manifesto == "" {
		b.Manifesto = d.Manifesto
	}
	if b.ShowPromoBanners == nil {
		b.ShowPromoBanners = boolPtr(true)
	}
	if b.ShowBrandStory == nil {
		b.ShowBrandStory = boolPtr(true)
	}
	if b.ShowManifesto == nil {
		b.ShowManifesto = boolPtr(true)
	}
	return b
}
