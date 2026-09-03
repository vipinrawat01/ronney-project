import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { luxuryEase } from '@/lib/motionVariants.js';

const FEATURED_PRODUCTS = [
  {
    id: 'featured-1',
    name: 'Canvas Tote Bag',
    price: 45,
    image: 'https://images.hostinger.com/bf8f6132-2617-4659-8733-71335300c422.png',
    description: 'Spacious everyday carry crafted from heavyweight organic cotton canvas with reinforced handles and an interior pocket for essentials.',
    link: '/category/women/tote-bags',
  },
  {
    id: 'featured-2',
    name: 'Floral Pouch Bag',
    price: 28,
    image: 'https://images.hostinger.com/d04a43d9-643b-4fd8-9b37-abad8073e87c.png',
    description: 'Hand-embroidered floral motifs on soft cotton twill — a delicate companion for jewelry, cosmetics, or cherished keepsakes.',
    link: '/category/women/pouch-bags',
  },
  {
    id: 'featured-3',
    name: 'Linen Laptop Sleeve',
    price: 52,
    image: 'https://images.hostinger.com/27aa0499-5c4d-45c9-acfc-f3969656e8fc.png',
    description: 'Breathable linen exterior with padded interior lining protects your device while adding understated elegance to your commute.',
    link: '/shop',
  },
  {
    id: 'featured-4',
    name: 'Travel Duffle Bag',
    price: 89,
    image: 'https://images.hostinger.com/2a3c4564-00d6-4f75-9c69-a0bf5ace5596.png',
    description: 'Generous capacity meets artisan leather accents — designed for weekend escapes with durable canvas that ages beautifully.',
    link: '/shop',
  },
  {
    id: 'featured-5',
    name: 'Printed Fabric Set',
    price: 35,
    image: 'https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png',
    description: 'A curated bundle of block-printed cotton fabrics, each piece telling a story of traditional Indian craftsmanship and natural dyes.',
    link: '/shop',
  },
];

const INTERVAL_MS = 5000;

const getOffset = (index, current, total) => {
  let offset = index - current;
  if (offset > total / 2) offset -= total;
  if (offset < -total / 2) offset += total;
  return offset;
};

const FeaturedProductCarousel = () => {
  const [products, setProducts] = useState(FEATURED_PRODUCTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const res = await pb.collection('products').getList(1, 5, { sort: '-created', $autoCancel: false });
        if (res.items.length > 0) {
          setProducts(
            res.items.map((p, i) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.images?.[0]
                ? pb.files.getURL(p, p.images[0], { thumb: '600x800' })
                : FEATURED_PRODUCTS[i % FEATURED_PRODUCTS.length].image,
              description:
                p.description ||
                p.fabricDetails ||
                FEATURED_PRODUCTS[i % FEATURED_PRODUCTS.length].description,
              link: `/product/${p.id}`,
            }))
          );
        }
      } catch {
        /* use static fallback */
      }
    })();
  }, []);

  const goTo = useCallback(
    (index) => {
      setCurrentIndex((index + products.length) % products.length);
    },
    [products.length]
  );

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (isPaused || shouldReduceMotion) return;
    const timer = setInterval(goNext, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [goNext, isPaused, shouldReduceMotion]);

  const active = products[currentIndex];

  return (
    <section
      className="py-24 md:py-32 bg-background overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: luxuryEase }}
          className="text-center mb-14"
        >
          <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-3">Signature Pieces</span>
          <h2 className="text-3xl md:text-4xl font-serif">Featured Collection</h2>
        </motion.div>

        <div className="relative">
          {/* Radial glow backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[min(90vw,600px)] h-[min(90vw,600px)] rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Cover-flow carousel */}
          <div className="relative h-[340px] sm:h-[380px] md:h-[420px] flex items-center justify-center">
            <button
              onClick={goPrev}
              className="absolute left-0 md:left-4 z-30 p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Previous product"
            >
              <ChevronLeft className="w-8 h-8" strokeWidth={1.25} />
            </button>

            <div className="relative w-full max-w-4xl mx-auto h-full flex items-center justify-center perspective-[1200px]">
              {products.map((product, index) => {
                const offset = getOffset(index, currentIndex, products.length);
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
                    key={product.id}
                    className="absolute cursor-pointer"
                    animate={{
                      x,
                      scale,
                      rotateY,
                      zIndex,
                      opacity,
                    }}
                    transition={{ duration: 0.9, ease: luxuryEase }}
                    onClick={() => !isActive && goTo(index)}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className={`bg-background shadow-2xl shadow-black/10 transition-shadow duration-700 ${
                        isActive ? 'p-3 pb-5' : 'p-2 pb-3'
                      }`}
                    >
                      <div
                        className={`overflow-hidden bg-muted ${
                          isActive ? 'w-[220px] sm:w-[260px] md:w-[300px] aspect-[3/4]' : 'w-[180px] sm:w-[200px] aspect-[3/4]'
                        }`}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
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
                          {product.name}
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
              aria-label="Next product"
            >
              <ChevronRight className="w-8 h-8" strokeWidth={1.25} />
            </button>
          </div>

          {/* Description panel */}
          <div className="max-w-2xl mx-auto text-center mt-10 min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.7, ease: luxuryEase }}
              >
                <h3 className="text-xl md:text-2xl font-serif mb-3">{active.name}</h3>
                <p className="text-muted-foreground font-light leading-relaxed mb-5 text-base md:text-lg">
                  {active.description}
                </p>
                <div className="flex items-center justify-center gap-6">
                  <span className="text-lg font-semibold text-foreground">${active.price?.toFixed(2)}</span>
                  <Link
                    to={active.link}
                    className="text-sm font-semibold uppercase tracking-widest text-primary hover:text-foreground transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-3 mt-10">
            {products.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-1 transition-all duration-500 ${
                  currentIndex === idx ? 'w-8 bg-foreground' : 'w-4 bg-border hover:bg-muted-foreground'
                }`}
                aria-label={`Go to product ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProductCarousel;
