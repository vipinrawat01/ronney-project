import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { luxuryEase } from '@/lib/motionVariants.js';

const lookbookImages = [
  {
    id: 1,
    src: 'https://images.hostinger.com/f6d393c2-1e22-4a11-9e42-f239d3f81838.png',
    category: 'Seasonal Collections',
    title: 'Spring Awakening',
  },
  {
    id: 2,
    src: 'https://images.hostinger.com/ffeeb997-7801-4b5c-a995-77b4f488bdf3.png',
    category: 'Styled Lookbooks',
    title: 'Urban Silhouette',
  },
  {
    id: 3,
    src: 'https://images.hostinger.com/32ffb92d-4dba-4ce2-a807-88d9c09f2578.png',
    category: 'Behind-the-Scenes',
    title: 'Atelier Details',
  },
];

const LookbookGallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const shouldReduceMotion = useReducedMotion();

  const openLightbox = (index) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);

  const nextImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev === lookbookImages.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setSelectedImage((prev) => (prev === 0 ? lookbookImages.length - 1 : prev - 1));
  };

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: luxuryEase }}
          className="text-center mb-16"
        >
          <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-4">Editorial</span>
          <h2>The Lookbook</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-6 text-lg font-light">
            A visual narrative of our latest pieces, styled for the modern muse.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lookbookImages.map((img, index) => (
            <motion.div
              key={img.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.08, duration: 0.9, ease: luxuryEase }}
              className="group relative cursor-pointer overflow-hidden aspect-[3/4] bg-accent rounded-2xl"
              onClick={() => openLightbox(index)}
            >
              <img
                src={img.src}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <span className="text-white/80 text-xs uppercase tracking-widest mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{img.category}</span>
                <h3 className="text-white text-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{img.title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>

            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors"
              onClick={prevImage}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <img
              src={lookbookImages[selectedImage].src}
              alt={lookbookImages[selectedImage].title}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-2 transition-colors"
              onClick={nextImage}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="absolute bottom-8 text-center" onClick={(e) => e.stopPropagation()}>
              <h4 className="text-white text-xl font-serif">{lookbookImages[selectedImage].title}</h4>
              <p className="text-white/60 text-sm tracking-widest uppercase mt-2">{lookbookImages[selectedImage].category}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LookbookGallery;
