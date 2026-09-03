import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronUp, ChevronDown, PanelLeft, PanelLeftClose } from 'lucide-react';
import { getCategories, getProducts, getProduct } from '@/api/EcommerceApi.js';
import { luxuryEase } from '@/lib/motionVariants.js';

const FALLBACK =
  'https://images.hostinger.com/bf8f6132-2617-4659-8733-71335300c422.png';

const DEFAULT_FABRICS = [
  { id: 'linen', label: 'Linen', swatch: '#C4B39A' },
  { id: 'cotton', label: 'Cotton', swatch: '#E8DFD2' },
  { id: 'silk', label: 'Silk', swatch: '#D4C4B0' },
  { id: 'canvas', label: 'Canvas', swatch: '#A89070' },
  { id: 'wool', label: 'Wool', swatch: '#8C7355' },
];

const DEFAULT_PRINTS = [
  { id: 'solid', label: 'Solid' },
  { id: 'floral', label: 'Floral' },
  { id: 'geometric', label: 'Geo' },
  { id: 'stripe', label: 'Stripe' },
];

function mapCategoryFabrics(raw) {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw
    .map((f, i) => ({
      id: f.id || `fabric-${i}`,
      label: f.name || f.label || `Fabric ${i + 1}`,
      image: f.image || null,
      swatch: DEFAULT_FABRICS[i % DEFAULT_FABRICS.length].swatch,
    }))
    .filter((f) => f.label);
}

function mapCategoryPrints(raw) {
  if (!Array.isArray(raw) || !raw.length) return [];
  return raw
    .map((p, i) => ({
      id: p.id || `print-${i}`,
      label: p.name || p.label || `Print ${i + 1}`,
      image: p.image || null,
    }))
    .filter((p) => p.label);
}

function parseOptionsJson(raw) {
  if (!raw) return {};
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function extractFabrics(product, categoryFabrics = []) {
  if (categoryFabrics.length) return categoryFabrics;

  const fromOptions = (product?.options || []).find(
    (o) => /fabric|material|colour|color/i.test(o.title || '')
  );
  if (fromOptions?.values?.length) {
    return fromOptions.values.map((v, i) => ({
      id: v.id || `fabric-${i}`,
      label: v.value,
      image: null,
      swatch: DEFAULT_FABRICS[i % DEFAULT_FABRICS.length].swatch,
    }));
  }

  const fromVariants = (product?.variants || [])
    .map((v, i) => {
      const opts = parseOptionsJson(v.options_json);
      const label = opts.fabric || opts.material || v.title?.split(/[|/–-]/)[0]?.trim();
      if (!label) return null;
      return {
        id: `v-fabric-${v.id || i}`,
        label,
        image: v.image_url || v.images?.[0]?.url || null,
        swatch: DEFAULT_FABRICS[i % DEFAULT_FABRICS.length].swatch,
        variantId: v.id,
      };
    })
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  for (const f of fromVariants) {
    const key = f.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(f);
  }
  if (unique.length) return unique;
  return DEFAULT_FABRICS;
}

function extractPrints(product, categoryPrints = []) {
  if (categoryPrints.length) return categoryPrints;

  const fromOptions = (product?.options || []).find((o) =>
    /print|pattern|motif/i.test(o.title || '')
  );
  if (fromOptions?.values?.length) {
    return fromOptions.values.map((v, i) => ({
      id: v.id || `print-${i}`,
      label: v.value,
      image: null,
    }));
  }

  const fromVariants = (product?.variants || [])
    .map((v, i) => {
      const opts = parseOptionsJson(v.options_json);
      const parts = (v.title || '').split(/[|/–-]/).map((s) => s.trim()).filter(Boolean);
      const label = opts.print || opts.pattern || parts[1];
      if (!label) return null;
      return {
        id: `v-print-${v.id || i}`,
        label,
        image: v.image_url || v.images?.[0]?.url || null,
        variantId: v.id,
      };
    })
    .filter(Boolean);

  const unique = [];
  const seen = new Set();
  for (const p of fromVariants) {
    const key = p.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(p);
  }
  if (unique.length) return unique;
  return DEFAULT_PRINTS;
}

function collectImages(product, variant) {
  const urls = [];
  const push = (url) => {
    if (url && !urls.includes(url)) urls.push(url);
  };
  (variant?.images || []).forEach((img) => push(img.url || img));
  push(variant?.image_url);
  (product?.images || []).forEach((img) => push(img.url || img));
  push(product?.image);
  push(product?.thumbnail);
  if (!urls.length) push(FALLBACK);
  return urls;
}

function plainText(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Brochure layout for a category:
 * - Left: category title + scrollable product list
 * - Right: fixed viewport product stage (fabrics, prints, hero, gallery, details)
 */
const CategoryImmersivePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [fabricId, setFabricId] = useState(null);
  const [printId, setPrintId] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts({ category_id: id, limit: 100 }),
        ]);
        const found = (cats.categories || []).find((c) => String(c.id) === String(id));
        const list = prods.products || [];
        if (!cancelled) {
          setCategory(
            found
              ? {
                  id: found.id,
                  name: found.title,
                  description: found.description || found.metadata?.description || '',
                  type: found.metadata?.type,
                  fabrics: mapCategoryFabrics(found.fabrics || found.metadata?.fabrics),
                  prints: mapCategoryPrints(found.prints || found.metadata?.prints),
                }
              : { id, name: 'Collection', description: '', type: null, fabrics: [], prints: [] }
          );
          setProducts(list);
          setSelectedId(list[0] ? String(list[0].id) : null);
        }
      } catch {
        if (!cancelled) {
          setCategory(null);
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setDetailLoading(true);
      setImageIndex(0);
      try {
        const full = await getProduct(selectedId);
        if (!cancelled) {
          setDetail(full);
          const fabrics = extractFabrics(full, category?.fabrics || []);
          const prints = extractPrints(full, category?.prints || []);
          setFabricId(fabrics[0]?.id || null);
          setPrintId(prints[0]?.id || null);
        }
      } catch {
        const fallback = products.find((p) => String(p.id) === String(selectedId));
        if (!cancelled) setDetail(fallback || null);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, products, category?.fabrics, category?.prints]);

  const fabrics = useMemo(
    () => extractFabrics(detail, category?.fabrics || []),
    [detail, category?.fabrics]
  );
  const prints = useMemo(
    () => extractPrints(detail, category?.prints || []),
    [detail, category?.prints]
  );

  const activeVariant = useMemo(() => {
    if (!detail?.variants?.length) return null;
    const fabric = fabrics.find((f) => f.id === fabricId);
    const print = prints.find((p) => p.id === printId);
    const match = detail.variants.find((v) => {
      const opts = parseOptionsJson(v.options_json);
      const title = (v.title || '').toLowerCase();
      const fabricOk =
        !fabric ||
        opts.fabric?.toLowerCase() === fabric.label.toLowerCase() ||
        title.includes(fabric.label.toLowerCase()) ||
        String(fabric.variantId) === String(v.id);
      const printOk =
        !print ||
        print.id?.startsWith('solid') ||
        opts.print?.toLowerCase() === print.label.toLowerCase() ||
        title.includes(print.label.toLowerCase()) ||
        String(print.variantId) === String(v.id);
      return fabricOk && printOk;
    });
    return match || detail.variants[0];
  }, [detail, fabrics, prints, fabricId, printId]);

  const gallery = useMemo(
    () => collectImages(detail, activeVariant),
    [detail, activeVariant]
  );

  useEffect(() => {
    setImageIndex(0);
  }, [fabricId, printId, selectedId]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading brochure…
      </div>
    );
  }

  if (!category) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-3xl font-serif">Collection not found</h1>
        <button type="button" onClick={() => navigate('/category')} className="luxury-button luxury-button-primary">
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-background text-foreground">
      <Helmet>
        <title>{category.name} | Alliraa Textile</title>
      </Helmet>

      <div className="h-full w-full flex flex-row relative">
        {/* ——— Left panel: category + scrollable products ——— */}
        <aside
          className={`h-full shrink-0 border-r border-border/80 bg-[#f7f3ec] flex flex-col overflow-hidden transition-[width] duration-300 ease-out ${
            sidebarOpen
              ? 'w-[42vw] max-w-[220px] md:w-[200px] md:max-w-none lg:w-[260px] xl:w-[300px]'
              : 'w-0 border-r-0'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <div className={`px-3 md:px-4 pt-4 pb-3 border-b border-border/60 shrink-0 min-w-[42vw] md:min-w-[200px] lg:min-w-[260px] xl:min-w-[300px] ${sidebarOpen ? '' : 'invisible'}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                type="button"
                onClick={() => navigate('/category')}
                className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
                Back
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/70 transition-colors"
                aria-label="Close product list"
                title="Close sidebar"
              >
                <PanelLeftClose className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
            {category.type && (
              <p className="text-[10px] uppercase tracking-[0.22em] text-primary font-semibold mb-1">
                {category.type}
              </p>
            )}
            <h1 className="font-serif text-lg md:text-xl lg:text-2xl leading-tight">{category.name}</h1>
          </div>

          <div className={`flex-1 overflow-y-auto overscroll-contain px-2 md:px-3 py-2 md:py-3 space-y-2 md:space-y-3 custom-scroll min-w-[42vw] md:min-w-[200px] lg:min-w-[260px] xl:min-w-[300px] ${sidebarOpen ? '' : 'invisible'}`}>
            {products.length === 0 && (
              <p className="text-sm text-muted-foreground px-2 py-8 text-center">
                No products in this category yet.
              </p>
            )}
            {products.map((p) => {
              const active = String(p.id) === String(selectedId);
              const thumb = p.image || p.images?.[0]?.url || FALLBACK;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(String(p.id))}
                  className={`w-full text-left group rounded-sm overflow-hidden border transition-all duration-300 ${
                    active
                      ? 'border-primary/50 shadow-md shadow-black/5 bg-background'
                      : 'border-transparent hover:border-border bg-background/50 hover:bg-background'
                  }`}
                >
                  <div className="aspect-[4/5] overflow-hidden bg-muted">
                    <img
                      src={thumb}
                      alt={p.title || p.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${
                        active ? 'scale-105' : 'group-hover:scale-105'
                      }`}
                      loading="lazy"
                    />
                  </div>
                  <div className="px-2 md:px-3 py-2">
                    <p className={`font-serif text-xs md:text-sm leading-snug ${active ? 'text-primary' : ''}`}>
                      {p.title || p.name}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ——— Right panel: fixed brochure stage ——— */}
        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col px-3 sm:px-4 md:px-5 lg:px-8 py-3 md:py-4 lg:py-5 relative transition-[padding] duration-300">
          {/* Open sidebar when collapsed */}
          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-3 left-3 z-40 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-background/90 border border-border shadow-sm text-[10px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Open product list"
            >
              <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
              Products
            </button>
          )}

          {!selectedId && (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a product from the list
            </div>
          )}

          {selectedId && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: luxuryEase }}
                className={`flex-1 min-h-0 flex flex-col gap-2 md:gap-3 lg:gap-4 ${!sidebarOpen ? 'pt-8' : ''}`}
              >
                {/* Fabric options — top circles/cards */}
                <div className="shrink-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    Fabric
                  </p>
                  <div className="flex items-center gap-2.5 md:gap-3 overflow-x-auto pb-1 custom-scroll">
                    {fabrics.map((f) => {
                      const on = f.id === fabricId;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          title={f.label}
                          onClick={() => setFabricId(f.id)}
                          className={`shrink-0 flex flex-col items-center gap-1.5 transition-transform duration-300 ${
                            on ? 'scale-105' : 'opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span
                            className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full overflow-hidden border-2 shadow-sm ${
                              on ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                            }`}
                            style={{ background: f.swatch || '#ddd' }}
                          >
                            {f.image && (
                              <img src={f.image} alt="" className="w-full h-full object-cover" />
                            )}
                          </span>
                          <span className={`text-[10px] tracking-wide ${on ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                            {f.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Stage: prints | hero | gallery — fills remaining height */}
                <div className="flex-1 min-h-0 grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 md:gap-3 lg:gap-5 items-stretch">
                  {/* Print types */}
                  <div className="flex flex-col justify-center gap-1.5 md:gap-2 lg:gap-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-center mb-0.5">
                      Print
                    </p>
                    {prints.map((p) => {
                      const on = p.id === printId;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setPrintId(p.id)}
                          className={`w-11 h-11 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-md overflow-hidden border transition-all duration-300 flex items-center justify-center text-center px-1 ${
                            on
                              ? 'border-primary shadow-md bg-background scale-105'
                              : 'border-border/80 bg-muted/40 hover:border-primary/40'
                          }`}
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.label} className="w-full h-full object-cover" />
                          ) : (
                            <span className={`text-[8px] md:text-[9px] leading-tight uppercase tracking-wider ${on ? 'text-primary' : 'text-muted-foreground'}`}>
                              {p.label}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Main image — grows with available space */}
                  <div className="min-w-0 min-h-0 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[75%] h-[75%] rounded-full bg-primary/5 blur-3xl" />
                    </div>
                    <div
                      className={`relative h-full w-full mx-auto bg-background shadow-[0_20px_60px_rgba(28,25,21,0.1)] p-1.5 md:p-2 lg:p-3 transition-all duration-300 ${
                        sidebarOpen ? 'max-w-full lg:max-w-3xl' : 'max-w-full'
                      }`}
                    >
                      <div className="relative h-full w-full overflow-hidden bg-muted">
                        {detailLoading ? (
                          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                            Loading…
                          </div>
                        ) : (
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={`${selectedId}-${imageIndex}-${fabricId}-${printId}`}
                              src={gallery[imageIndex] || FALLBACK}
                              alt={detail?.title || detail?.name || ''}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.35 }}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                          </AnimatePresence>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Gallery strip */}
                  <div className="flex flex-col items-center justify-center gap-1.5 md:gap-2 min-h-0 py-1">
                    <button
                      type="button"
                      aria-label="Previous image"
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={gallery.length < 2}
                      onClick={() =>
                        setImageIndex((i) => (i - 1 + gallery.length) % gallery.length)
                      }
                    >
                      <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scroll flex flex-col gap-1.5 md:gap-2 max-h-full py-1">
                      {gallery.map((url, i) => {
                        const on = i === imageIndex;
                        return (
                          <button
                            key={`${url}-${i}`}
                            type="button"
                            onClick={() => setImageIndex(i)}
                            className={`w-11 h-11 md:w-12 md:h-12 lg:w-16 lg:h-16 shrink-0 rounded-full md:rounded-md overflow-hidden border transition-all ${
                              on
                                ? 'border-primary ring-2 ring-primary/15'
                                : 'border-border/70 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      aria-label="Next image"
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                      disabled={gallery.length < 2}
                      onClick={() => setImageIndex((i) => (i + 1) % gallery.length)}
                    >
                      <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Name & description */}
                <div className="shrink-0 border-t border-border/70 pt-2.5 md:pt-3 lg:pt-4 text-center">
                  <div className="min-w-0">
                    <h2 className="font-serif text-lg md:text-xl lg:text-2xl truncate">
                      {detail?.title || detail?.name || 'Product'}
                    </h2>
                    <p className="text-xs md:text-sm text-muted-foreground font-light leading-relaxed mt-1 line-clamp-2 max-w-3xl">
                      {plainText(detail?.description) ||
                        detail?.subtitle ||
                        'Premium textile piece from the Alliraa collection.'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <style>{`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--primary) / 0.35) transparent;
        }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--primary) / 0.35);
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default CategoryImmersivePage;
