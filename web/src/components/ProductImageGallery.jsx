import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';

const ProductImageGallery = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = product.images && product.images.length > 0 
    ? product.images.map(img => pb.files.getUrl(product, img))
    : ['https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=800&q=80'];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 h-full">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:w-24 flex-shrink-0 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative aspect-[3/4] w-20 md:w-full flex-shrink-0 overflow-hidden transition-all duration-300 ${
                currentIndex === idx ? 'ring-1 ring-primary ring-offset-2' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative flex-grow aspect-[3/4] md:aspect-auto md:h-[80vh] bg-secondary overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${product.name} view ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductImageGallery;