import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ads = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1614522236054-d221ab3f673d?q=80&w=2000',
    subtitle: 'New Arrival',
    title: 'The Golden Hour Collection',
    link: '/category/women/kimono',
    cta: 'Discover More'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1647412983914-783bc576b456?q=80&w=2000',
    subtitle: 'Signature Series',
    title: 'Modern Evening Wear',
    link: '/category/women/floral',
    cta: 'Shop Evening'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1631701368016-dfb7bd2fbd59?q=80&w=2000',
    subtitle: 'Limited Edition',
    title: 'Bespoke Tailoring',
    link: '/category/women/ethnic-wear',
    cta: 'Explore Bespoke'
  }
];

const PromotionalAdsCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev === ads.length - 1 ? 0 : prev + 1));
  const prev = () => setCurrent((prev) => (prev === 0 ? ads.length - 1 : prev - 1));

  return (
    <div className="relative h-[80vh] w-full overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img 
            src={ads[current].image} 
            alt={ads[current].title} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <motion.span 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 block"
              >
                {ads[current].subtitle}
              </motion.span>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl mb-8 font-serif"
              >
                {ads[current].title}
              </motion.h2>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                <Link to={ads[current].link} className="luxury-button border border-white text-white hover:bg-primary hover:border-primary transition-all">
                  {ads[current].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white border border-white/20 rounded-full backdrop-blur-sm transition-all z-10"><ChevronLeft /></button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white border border-white/20 rounded-full backdrop-blur-sm transition-all z-10"><ChevronRight /></button>
    </div>
  );
};

export default PromotionalAdsCarousel;