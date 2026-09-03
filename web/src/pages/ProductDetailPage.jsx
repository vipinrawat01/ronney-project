import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, getProductQuantities, getProducts, initializeCheckout } from '@/api/EcommerceApi';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import {
  ShoppingCart, Loader2, ArrowLeft, CheckCircle, Minus, Plus, XCircle,
  ChevronLeft, ChevronRight, Heart, Share2, Star, Truck, RotateCcw, Leaf,
  Sparkles, Scissors, ShieldCheck, ChevronDown, Facebook, Instagram, Mail,
  MessageCircle, Ruler, Package, Clock, ThumbsUp, ThumbsDown, Send
} from 'lucide-react';

const placeholderImage = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjRFRkU5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjIwIiBmaWxsPSIjQjg5MDQzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QUxMSVJBQTwvdGV4dD48L3N2Zz4=";

const SWATCHES = ['#B89043', '#1A1A1A', '#8C6A56', '#A7B0A0', '#C9A9A6', '#5C6B73'];

const KEY_FEATURES = [
  { icon: Sparkles, label: 'Premium Handmade' },
  { icon: Leaf, label: 'Eco-Friendly Materials' },
  { icon: Scissors, label: 'Durable Stitching' },
  { icon: ShieldCheck, label: 'Customizable Designs' },
];

const SPECS = [
  { icon: Package, label: 'Material', value: '100% Premium Cotton' },
  { icon: Ruler, label: 'Weight', value: '320 GSM' },
  { icon: Ruler, label: 'Dimensions', value: 'Made to standard fit' },
  { icon: RotateCcw, label: 'Care', value: 'Machine wash cold, hang dry' },
  { icon: Package, label: 'MOQ', value: '50 units (wholesale)' },
  { icon: Clock, label: 'Production Time', value: '2–3 weeks' },
  { icon: CheckCircle, label: 'Customization', value: 'Available' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const REVIEWS_SEED = [
  { name: 'Amara Okafor', rating: 5, date: 'March 2, 2026', title: 'Exquisite craftsmanship', text: 'The fabric quality exceeded my expectations. Stitching is impeccable and the print is vibrant even after washing.' },
  { name: 'Liam Bennett', rating: 5, date: 'February 18, 2026', title: 'Worth every penny', text: 'Ordered for my boutique in London. Customers love it. Will definitely place a bulk order.' },
  { name: 'Sofia Marchetti', rating: 4, date: 'February 5, 2026', title: 'Beautiful and elegant', text: 'Gorgeous piece. Delivery to Milan took a little longer than expected but the product is flawless.' },
];

function Rating({ value = 4.8, size = 16, className = '' }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? 'fill-primary text-primary' : 'text-border'}
        />
      ))}
    </div>
  );
}

function Collapsible({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="flex items-center gap-3 font-medium">
          <Icon size={18} className="text-primary" /> {title}
        </span>
        <ChevronDown size={18} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });
  const [shareOpen, setShareOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState(REVIEWS_SEED);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, title: '', text: '' });
  const imgRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetched = await getProduct(id);
        try {
          const q = await getProductQuantities({ fields: 'inventory_quantity', product_ids: [fetched.id] });
          const map = new Map(q.variants.map((v) => [v.id, v.inventory_quantity]));
          fetched.variants = fetched.variants.map((v) => ({
            ...v,
            inventory_quantity: map.get(v.id) ?? v.inventory_quantity,
          }));
        } catch (e) { /* inventory optional */ }
        if (cancelled) return;
        setProduct(fetched);
        setCurrentImageIndex(0);
        setQuantity(1);
        if (fetched.variants?.length) setSelectedVariant(fetched.variants[0]);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then((res) => setRelated((res.products || []).filter((p) => p.id !== id).slice(0, 4)))
      .catch(() => setRelated([]));
  }, [id]);

  const images = product?.images?.length ? product.images : [{ url: '' }];
  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => setCurrentImageIndex((p) => (p === 0 ? images.length - 1 : p - 1)), [images.length]);
  const handleNext = useCallback(() => setCurrentImageIndex((p) => (p === images.length - 1 ? 0 : p + 1)), [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handlePrev, handleNext]);

  const handleVariantSelect = useCallback((variant) => {
    setSelectedVariant(variant);
    if (variant.image_url && product?.images?.length) {
      const idx = product.images.findIndex((im) => im.url === variant.image_url);
      if (idx !== -1) setCurrentImageIndex(idx);
    }
  }, [product]);

  const handleQuantityChange = useCallback((amount) => {
    setQuantity((q) => Math.max(1, q + amount));
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product || !selectedVariant) return;
    try {
      await addToCart(product, selectedVariant, quantity, selectedVariant.inventory_quantity);
      toast({ title: 'Added to Cart', description: `${quantity} × ${product.title} (${selectedSize}) added.` });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Unable to add', description: e.message });
    }
  }, [product, selectedVariant, quantity, selectedSize, addToCart, toast]);

  const handleBuyNow = useCallback(async () => {
    if (!selectedVariant) return;
    try {
      const { url } = await initializeCheckout({
        items: [{ variant_id: selectedVariant.id, quantity }],
        successUrl: `${window.location.origin}/orders`,
        cancelUrl: window.location.href,
      });
      window.location.href = url;
    } catch (e) {
      toast({ variant: 'destructive', title: 'Checkout failed', description: e.message });
    }
  }, [selectedVariant, quantity, toast]);

  const toggleWishlist = useCallback(() => {
    if (!product) return;
    const item = { id: product.id, name: product.title, price: (selectedVariant?.price_in_cents || 0) / 100, image: images[0]?.url };
    if (isInWishlist(product.id)) removeFromWishlist(product.id);
    else addToWishlist(item);
  }, [product, selectedVariant, images, isInWishlist, removeFromWishlist, addToWishlist]);

  const shareLinks = useMemo(() => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = product ? `Check out ${product.title} at Alliraa Textile` : '';
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`,
      instagram: 'https://instagram.com',
    };
  }, [product]);

  const submitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) {
      toast({ variant: 'destructive', title: 'Please fill in your name and review.' });
      return;
    }
    setReviews((r) => [{ ...reviewForm, date: 'Just now' }, ...r]);
    setReviewForm({ name: '', rating: 5, title: '', text: '' });
    toast({ title: 'Thank you!', description: 'Your review has been added.' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-14 w-14 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto pt-40 pb-24 px-6 text-center">
        <XCircle className="mx-auto h-16 w-16 text-destructive mb-6" />
        <h1 className="text-2xl font-serif mb-4">Product Unavailable</h1>
        <p className="text-muted-foreground mb-8">{error || 'This product could not be found.'}</p>
        <Link to="/shop" className="luxury-button luxury-button-primary">Back to Shop</Link>
      </div>
    );
  }

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) || 4.8;
  const price = selectedVariant?.sale_price_formatted || selectedVariant?.price_formatted;
  const originalPrice = selectedVariant?.price_formatted;
  const stock = selectedVariant?.inventory_quantity;
  const managed = selectedVariant?.manage_inventory;
  const stockLabel = !managed ? 'In Stock' : stock > 10 ? 'In Stock' : stock > 0 ? `Low Stock — ${stock} left` : 'Out of Stock';
  const stockColor = !managed || stock > 10 ? 'text-green-600' : stock > 0 ? 'text-amber-600' : 'text-destructive';
  const canAdd = product.purchasable && (!managed || (stock > 0 && quantity <= stock));
  const currentImage = images[currentImageIndex];
  const wished = isInWishlist(product.id);

  return (
    <>
      <Helmet>
        <title>{product.title} | Alliraa Textile</title>
        <meta name="description" content={(product.description || product.title)?.replace(/<[^>]+>/g, '').substring(0, 160)} />
      </Helmet>

      <div className="pt-28 pb-24 bg-background">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
          </nav>

          {/* Main grid */}
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16">
            {/* Gallery */}
            <div>
              <div
                ref={imgRef}
                className="relative overflow-hidden rounded-[20px] bg-accent aspect-[4/5] cursor-zoom-in shadow-sm"
                onMouseMove={(e) => {
                  const r = imgRef.current.getBoundingClientRect();
                  setZoom({ active: true, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
                }}
                onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={currentImage?.url || placeholderImage}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: zoom.active ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${zoom.x}% ${zoom.y}%`,
                    }}
                  />
                </AnimatePresence>
                {product.ribbon_text && (
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full shadow">
                    {product.ribbon_text}
                  </div>
                )}
                {hasMultiple && (
                  <>
                    <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card text-foreground p-2.5 rounded-full shadow transition" aria-label="Previous image">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-card/90 hover:bg-card text-foreground p-2.5 rounded-full shadow transition" aria-label="Next image">
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
              </div>

              {hasMultiple && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((im, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition ${idx === currentImageIndex ? 'border-primary' : 'border-transparent hover:border-border'}`}
                    >
                      <img src={im.url || placeholderImage} alt={`${product.title} ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-5xl font-serif mb-3">{product.title}</h1>
              <div className="flex items-center gap-3 mb-5">
                <Rating value={avgRating} />
                <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-serif text-primary">{price}</span>
                {selectedVariant?.sale_price_in_cents && (
                  <span className="text-xl text-muted-foreground line-through">{originalPrice}</span>
                )}
              </div>

              <p className={`text-sm font-medium mb-5 flex items-center gap-2 ${stockColor}`}>
                <span className="w-2 h-2 rounded-full bg-current inline-block" /> {stockLabel}
              </p>

              {product.subtitle && <p className="text-muted-foreground mb-4">{product.subtitle}</p>}
              <div className="prose prose-sm text-muted-foreground max-w-none mb-8 line-clamp-3" dangerouslySetInnerHTML={{ __html: product.description || '' }} />

              {/* Colors / prints */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Colours & Prints
                  {selectedVariant && <span className="text-muted-foreground font-normal"> — {selectedVariant.title}</span>}
                </p>
                <div className="flex flex-wrap gap-3">
                  {(product.variants?.length > 1 ? product.variants : SWATCHES.map((c, i) => ({ id: `sw-${i}`, color: c, title: `Shade ${i + 1}` }))).map((v, i) => {
                    const isSel = selectedVariant?.id === v.id || (!product.variants?.length && i === 0);
                    return (
                      <motion.button
                        key={v.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => (product.variants?.length > 1 ? handleVariantSelect(v) : null)}
                        title={v.title}
                        className={`w-10 h-10 rounded-full border-2 transition overflow-hidden ${isSel ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}
                        style={{ backgroundColor: v.color || SWATCHES[i % SWATCHES.length] }}
                      >
                        {v.image_url && <img src={v.image_url} alt={v.title} className="w-full h-full object-cover" />}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Size</p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-11 px-3 rounded-full border text-sm font-medium transition ${selectedSize === s ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border hover:border-primary'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-medium mb-3">Quantity</p>
                <div className="inline-flex items-center border border-border rounded-full p-1">
                  <button onClick={() => handleQuantityChange(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition" aria-label="Decrease"><Minus size={16} /></button>
                  <input
                    type="number"
                    value={quantity}
                    min={1}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 text-center bg-transparent font-semibold focus:outline-none"
                  />
                  <button onClick={() => handleQuantityChange(1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent transition" aria-label="Increase"><Plus size={16} /></button>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Button onClick={handleAddToCart} disabled={!canAdd} className="h-14 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground text-sm uppercase tracking-widest font-semibold transition active:scale-[0.98] disabled:opacity-50">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <Button onClick={handleBuyNow} disabled={!canAdd} variant="outline" className="h-14 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm uppercase tracking-widest font-semibold transition active:scale-[0.98] disabled:opacity-50">
                  Buy Now
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-8 relative">
                <button onClick={toggleWishlist} className="flex-1 h-12 rounded-full border border-border flex items-center justify-center gap-2 text-sm hover:border-primary transition">
                  <Heart size={16} className={wished ? 'fill-primary text-primary' : ''} /> {wished ? 'Wishlisted' : 'Wishlist'}
                </button>
                <div className="flex-1 relative">
                  <button onClick={() => setShareOpen((o) => !o)} className="w-full h-12 rounded-full border border-border flex items-center justify-center gap-2 text-sm hover:border-primary transition">
                    <Share2 size={16} /> Share
                  </button>
                  <AnimatePresence>
                    {shareOpen && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-14 right-0 z-20 bg-card border border-border rounded-2xl p-2 flex gap-2 shadow-lg">
                        <a href={shareLinks.facebook} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-accent" aria-label="Facebook"><Facebook size={18} /></a>
                        <a href={shareLinks.instagram} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-accent" aria-label="Instagram"><Instagram size={18} /></a>
                        <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="p-2 rounded-full hover:bg-accent" aria-label="WhatsApp"><MessageCircle size={18} /></a>
                        <a href={shareLinks.email} className="p-2 rounded-full hover:bg-accent" aria-label="Email"><Mail size={18} /></a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Key features */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {KEY_FEATURES.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-3 rounded-2xl bg-accent">
                    <f.icon size={18} className="text-primary flex-shrink-0" />
                    <span className="text-sm font-medium">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Delivery & returns */}
              <div className="space-y-3">
                <Collapsible icon={Truck} title="Delivery Information" defaultOpen>
                  <ul className="space-y-1 list-disc pl-4">
                    <li>Estimated delivery: 5–10 business days</li>
                    <li>Express & standard shipping methods available</li>
                    <li>Worldwide shipping to international buyers</li>
                  </ul>
                </Collapsible>
                <Collapsible icon={RotateCcw} title="Return Policy">
                  <ul className="space-y-1 list-disc pl-4">
                    <li>30-day return policy on all orders</li>
                    <li>Free returns within eligible regions</li>
                    <li>Simple, hassle-free return process</li>
                  </ul>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-20">
            <div className="flex gap-2 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
              {[
                { k: 'description', l: 'Description' },
                { k: 'specs', l: 'Specifications' },
                { k: 'reviews', l: 'Reviews' },
              ].map((t) => (
                <button
                  key={t.k}
                  onClick={() => setActiveTab(t.k)}
                  className={`px-5 py-3 text-sm uppercase tracking-widest font-medium whitespace-nowrap border-b-2 -mb-px transition ${activeTab === t.k ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {t.l}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="prose max-w-3xl text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description || '<p>Premium handcrafted textile from Alliraa.</p>' }} />
            )}

            {activeTab === 'specs' && (
              <div className="grid sm:grid-cols-2 gap-4 max-w-3xl">
                {SPECS.map((s) => (
                  <div key={s.label} className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card">
                    <s.icon size={18} className="text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-sm text-muted-foreground">{s.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card sm:col-span-2">
                  <Ruler size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Available Sizes</p>
                    <p className="text-sm text-muted-foreground">{SIZES.join(', ')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl">
                <div className="flex items-center gap-6 mb-8 p-6 rounded-2xl bg-accent">
                  <div className="text-center">
                    <p className="text-4xl font-serif text-primary">{avgRating.toFixed(1)}</p>
                    <Rating value={avgRating} className="justify-center mt-1" />
                    <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Rated by verified international buyers who value premium handmade textiles.</p>
                </div>

                <div className="space-y-6 mb-10">
                  {reviews.slice(0, 5).map((r, i) => (
                    <div key={i} className="border-b border-border pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium">{r.name}</p>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <Rating value={r.rating} size={14} className="mb-2" />
                      {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
                      <p className="text-sm text-muted-foreground mb-3">{r.text}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-primary"><ThumbsUp size={14} /> Helpful</button>
                        <button className="flex items-center gap-1 hover:text-primary"><ThumbsDown size={14} /> Not helpful</button>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={submitReview} className="p-6 rounded-2xl border border-border bg-card">
                  <h3 className="font-serif text-xl mb-4">Write a Review</h3>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <input value={reviewForm.name} onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-sm" />
                    <select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-sm">
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
                    </select>
                  </div>
                  <input value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} placeholder="Review title" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-sm mb-3" />
                  <textarea value={reviewForm.text} onChange={(e) => setReviewForm((f) => ({ ...f, text: e.target.value }))} placeholder="Share your experience..." rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-primary text-sm mb-4" />
                  <Button type="submit" className="rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground uppercase tracking-widest text-sm">
                    <Send size={14} className="mr-2" /> Submit Review
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-3xl font-serif mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -6 }} className="group">
                    <Link to={`/product/${p.id}`} className="block aspect-[4/5] overflow-hidden rounded-[20px] bg-accent mb-3">
                      <img src={p.image || p.images?.[0]?.url || placeholderImage} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </Link>
                    <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{p.title}</h3>
                    <p className="text-sm text-primary mt-1">
                      {p.currency === 'USD' ? '$' : p.currency === 'EUR' ? '€' : ''}{((p.price_in_cents || 0) / 100).toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Bulk inquiry */}
          <div className="mt-20 rounded-[24px] bg-secondary text-secondary-foreground p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-4 text-secondary-foreground">Interested in Bulk Orders?</h2>
            <p className="text-secondary-foreground/70 max-w-xl mx-auto mb-8">Contact us for wholesale pricing and custom manufacturing tailored to your business needs.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="luxury-button bg-primary text-primary-foreground hover:opacity-90">Send Bulk Inquiry</Link>
              <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" className="luxury-button border border-secondary-foreground/40 text-secondary-foreground hover:bg-primary hover:border-primary">
                <MessageCircle size={16} className="mr-2" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetailPage;
