import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1536593998369-f0d25ed0fb1d?q=80&w=2000',
    title: 'The Art of Layering',
    subtitle: 'Fall / Winter Collection',
    description: 'Embrace the season with textured linens and fluid silks designed for effortless transition.',
    link: '/shop',
    cta: 'Shop Now'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1647412983914-783bc576b456?q=80&w=2000',
    title: 'Modern Silhouettes',
    subtitle: 'Signature Dresses',
    description: 'Discover forms that celebrate movement. Crafted purely from natural fibers.',
    link: '/shop?category=Boho Maxi',
    cta: 'Explore Dresses'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1548953977-207c04eadc83?q=80&w=2000',
    title: 'Everyday Utility',
    subtitle: 'Leather & Canvas',
    description: 'Structured bags and pouches that carry your essentials with uncompromising style.',
    link: '/shop?category=Tote Bag',
    cta: 'View Accessories'
  }
];

const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);

    return () => clearInterval(timer);
  }, [isHovered]);

  const goToNext = () => setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const goToPrev = () => setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div 
      className="relative h-[90vh] md:h-[100dvh] w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${slides[currentIndex].image})` }}
          />
          <div className="absolute inset-0 bg-black/30" />
          
          <div className="absolute inset-0 flex items-center justify-center md:justify-start pt-20">
            <div className="container text-center md:text-left text-white px-4 md:px-12 w-full">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block text-primary font-semibold tracking-widest uppercase mb-4 text-xs md:text-sm"
              >
                {slides[currentIndex].subtitle}
              </motion.span>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mb-6 max-w-3xl"
              >
                {slides[currentIndex].title}
              </motion.h1>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-base md:text-lg mb-10 max-w-xl font-light text-white/90 leading-relaxed"
              >
                {slides[currentIndex].description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <Link 
                  to={slides[currentIndex].link}
                  className="inline-block bg-white text-black px-10 py-5 text-xs uppercase tracking-widest font-semibold hover:bg-primary hover:text-white transition-colors duration-300"
                >
                  {slides[currentIndex].cta}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 md:pl-8 z-20">
        <button 
          onClick={goToPrev}
          className="p-3 md:p-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-sm transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center pr-4 md:pr-8 z-20">
        <button 
          onClick={goToNext}
          className="p-3 md:p-4 rounded-full border border-white/20 text-white hover:bg-white hover:text-black backdrop-blur-sm transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>

      {/* Modern Line Indicators */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-4 z-20 px-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className="group py-2 w-16 md:w-24 relative flex items-center"
            aria-label={`Go to slide ${idx + 1}`}
          >
            <div className={`h-px w-full transition-all duration-500 ${
              currentIndex === idx ? 'bg-white' : 'bg-white/30 group-hover:bg-white/60'
            }`} />
            {currentIndex === idx && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 h-px bg-primary w-full" 
                transition={{ duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;