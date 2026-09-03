import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCategories } from '@/api/EcommerceApi.js';
import { luxuryEase } from '@/lib/motionVariants.js';
import { cn } from '@/lib/utils.js';

const FALLBACK_IMAGES = [
  'https://images.hostinger.com/bf8f6132-2617-4659-8733-71335300c422.png',
  'https://images.hostinger.com/d04a43d9-643b-4fd8-9b37-abad8073e87c.png',
  'https://images.hostinger.com/27aa0499-5c4d-45c9-acfc-f3969656e8fc.png',
  'https://images.hostinger.com/2a3c4564-00d6-4f75-9c69-a0bf5ace5596.png',
  'https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png',
];

const INTERVAL_MS = 5000;

const getOffset = (index, current, total) => {
  let offset = index - current;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
};

const mapCategory = (c, i) => ({
  id: c.id,
  name: c.title,
  description:
    c.description ||
    c.metadata?.description ||
    `Discover our curated ${c.title} collection — crafted with exceptional attention to detail and lasting materials.`,
  image: c.image_url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length],
  type: c.metadata?.type || 'women',
  slug: c.metadata?.slug || '',
});

/**
 * Dynamic 3D category carousel used on the home page (and category index).
 * @param {{ headingAs?: 'h1' | 'h2', className?: string }} props
 */
const ShopByCategoryCarousel = ({ headingAs = 'h2', className = '' }) => {
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const HeadingTag = headingAs;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getCategories();
        const all = data.categories || [];
        const leaves = all.filter((c) => c.metadata?.parent_id);
        const source = leaves.length > 0 ? leaves : all;
        if (!cancelled) setCategories(source.map(mapCategory));
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = useCallback(
    (index) => {
      if (!categories.length) return;
      setCurrentIndex((index + categories.length) % categories.length);
    },
    [categories.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion || categories.length < 2) return;
    const timer = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goNext, isPaused, shouldReduceMotion, categories.length]);

  const active = categories[currentIndex];
  const openCategory = (cat) => cat && navigate(`/category/view/${cat.id}`);

  return (
    <section
      id="shop-by-category"
      className={cn('py-16 md:py-20 bg-background overflow-hidden scroll-mt-28', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-3">
            Collections
          </span>
          <HeadingTag className="text-3xl md:text-4xl font-serif">Shop by Category</HeadingTag>
        </div>

        {loading && (
          <div className="h-[420px] flex items-center justify-center text-muted-foreground">
            Loading categories…
          </div>
        )}

        {!loading && categories.length === 0 && (
          <div className="max-w-md mx-auto text-center py-16">
            <h3 className="text-2xl font-serif mb-4">No categories yet</h3>
            <p className="text-muted-foreground mb-8">
              Add categories with images in the admin panel to populate this carousel.
            </p>
            <a href="http://localhost:8081/admin/" className="luxury-button luxury-button-primary">
              Open Admin
            </a>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[min(90vw,600px)] h-[min(90vw,600px)] rounded-full bg-primary/5 blur-3xl" />
            </div>

            <div className="relative h-[340px] sm:h-[380px] md:h-[420px] flex items-center justify-center">
              <button
                onClick={goPrev}
                className="absolute left-0 md:left-4 z-30 p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Previous category"
                type="button"
              >
                <ChevronLeft className="w-8 h-8" strokeWidth={1.25} />
              </button>

              <div className="relative w-full max-w-4xl mx-auto h-full flex items-center justify-center perspective-[1200px]">
                {categories.map((cat, index) => {
                  const offset = getOffset(index, currentIndex, categories.length);
                  const isActive = offset === 0;
                  const isVisible = Math.abs(offset) <= 2;
                  if (!isVisible) return null;

                  const x = offset * 240;
                  const scale = isActive ? 1 : Math.abs(offset) === 1 ? 0.78 : 0.62;
                  const rotateY = offset * -12;
                  const zIndex = 10 - Math.abs(offset);
                  const opacity = isActive ? 1 : Math.abs(offset) === 1 ? 0.75 : 0.45;

                  return (
                    <motion.div
                      key={cat.id}
                      className="absolute cursor-pointer"
                      animate={{ x, scale, rotateY, zIndex, opacity }}
                      transition={{ duration: 0.9, ease: luxuryEase }}
                      onClick={() => (isActive ? openCategory(cat) : goTo(index))}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div
                        className={`bg-background shadow-2xl shadow-black/10 transition-shadow duration-700 ${
                          isActive ? 'p-3 pb-5' : 'p-2 pb-3'
                        }`}
                      >
                        <div
                          className={`overflow-hidden bg-muted ${
                            isActive
                              ? 'w-[220px] sm:w-[260px] md:w-[300px] aspect-[3/4]'
                              : 'w-[180px] sm:w-[200px] aspect-[3/4]'
                          }`}
                        >
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-center font-serif text-sm mt-3 text-foreground"
                          >
                            {cat.name}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <button
                onClick={goNext}
                className="absolute right-0 md:right-4 z-30 p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Next category"
                type="button"
              >
                <ChevronRight className="w-8 h-8" strokeWidth={1.25} />
              </button>
            </div>

            <div className="max-w-2xl mx-auto text-center mt-10 min-h-[140px]">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={active.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                    transition={{ duration: 0.7, ease: luxuryEase }}
                  >
                    <h3 className="text-xl md:text-2xl font-serif mb-3">{active.name}</h3>
                    <p className="text-muted-foreground font-light leading-relaxed mb-6 text-base md:text-lg">
                      {active.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => openCategory(active)}
                      className="text-sm font-semibold uppercase tracking-widest text-primary hover:text-foreground transition-colors"
                    >
                      Explore Collection
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center gap-3 mt-10">
              {categories.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goTo(idx)}
                  className={`h-1 transition-all duration-500 ${
                    currentIndex === idx ? 'w-8 bg-foreground' : 'w-4 bg-border hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to category ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ShopByCategoryCarousel;
