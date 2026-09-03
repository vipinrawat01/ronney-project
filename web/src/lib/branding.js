export const DEFAULT_BRANDING = {
  store_name: 'Alliraa Textile',
  logo_url: '',
  colors: {
    primary: '#B89043',
    secondary: '#1A1A1A',
    background: '#FAF8F5',
    foreground: '#1F1F1F',
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Manrope',
    accent: 'Cormorant Garamond',
  },
  hero: {
    image_url: 'https://images.hostinger.com/f6d393c2-1e22-4a11-9e42-f239d3f81838.png',
    badge: 'New Collection 2026',
    title: 'Luxury Handmade Textile Collection',
    subtitle: 'Premium cotton bags & textile products crafted in India for worldwide buyers.',
  },
  promo_banners: [
    {
      badge: 'Summer Sale',
      title: 'Up to 50% Off',
      sub: 'On selected items',
      cta: 'Shop Now',
      link: '/shop',
      image: 'https://images.hostinger.com/ffeeb997-7801-4b5c-a995-77b4f488bdf3.png',
    },
    {
      badge: 'New Arrivals',
      title: 'Discover The Latest Trends',
      sub: '',
      cta: 'Explore Now',
      link: '/shop',
      image: 'https://images.hostinger.com/32ffb92d-4dba-4ce2-a807-88d9c09f2578.png',
    },
  ],
  brand_story: {
    image_url: 'https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png',
    title: 'A commitment to quiet luxury.',
    paragraph_1:
      'Alliraa Textile was born from a desire to return to the fundamentals of garment making. We believe that clothing should serve as a foundation—beautiful, enduring, and carefully considered.',
    paragraph_2:
      'By sourcing the finest natural fibers and partnering with specialized artisans, we craft pieces that respect both the wearer and the environment. Our designs reject seasonal urgency in favor of timeless utility.',
  },
  manifesto: 'Handcrafted in India · Natural fibers · Timeless design for the world',
  show_promo_banners: true,
  show_brand_story: true,
  show_manifesto: true,
};

function hexToHslParts(hex) {
  const raw = String(hex || '').replace('#', '').trim();
  if (raw.length !== 6) return null;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function loadGoogleFonts(fonts = {}) {
  const families = [...new Set([fonts.heading, fonts.body, fonts.accent].filter(Boolean))];
  if (!families.length || typeof document === 'undefined') return;
  const id = 'alliraa-dynamic-fonts';
  let link = document.getElementById(id);
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  const query = families
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:ital,wght@0,400;0,500;0,600;0,700;1,400`)
    .join('&');
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
}

export function applyBrandingTheme(branding) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const colors = branding?.colors || {};
  const map = {
    '--primary': colors.primary,
    '--ring': colors.primary,
    '--secondary': colors.secondary,
    '--background': colors.background,
    '--foreground': colors.foreground,
    '--card-foreground': colors.foreground,
    '--accent-foreground': colors.foreground,
  };
  Object.entries(map).forEach(([key, hex]) => {
    const hsl = hexToHslParts(hex);
    if (hsl) root.style.setProperty(key, hsl);
  });

  const fonts = branding?.fonts || {};
  loadGoogleFonts(fonts);
  if (fonts.body) document.body.style.fontFamily = `'${fonts.body}', sans-serif`;
  root.style.setProperty('--font-heading', fonts.heading ? `'${fonts.heading}', serif` : '');
  root.style.setProperty('--font-accent', fonts.accent ? `'${fonts.accent}', serif` : '');

  let styleEl = document.getElementById('alliraa-dynamic-font-rules');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'alliraa-dynamic-font-rules';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    h1, h2, h3, h4, h5, h6, .font-serif {
      font-family: var(--font-heading, 'Playfair Display', serif) !important;
    }
    .font-accent {
      font-family: var(--font-accent, 'Cormorant Garamond', serif) !important;
    }
  `;
}

export function mergeBranding(partial) {
  const base = structuredClone(DEFAULT_BRANDING);
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    colors: { ...base.colors, ...(partial.colors || {}) },
    fonts: { ...base.fonts, ...(partial.fonts || {}) },
    hero: { ...base.hero, ...(partial.hero || {}) },
    brand_story: { ...base.brand_story, ...(partial.brand_story || {}) },
    promo_banners: Array.isArray(partial.promo_banners) ? partial.promo_banners : base.promo_banners,
    show_promo_banners: partial.show_promo_banners ?? true,
    show_brand_story: partial.show_brand_story ?? true,
    show_manifesto: partial.show_manifesto ?? true,
  };
}
