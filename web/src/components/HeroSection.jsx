import React from 'react';
import { motion } from 'framer-motion';

function HeroSection({ image, title, subtitle, height = 'min-h-[60vh]' }) {
  return (
    <div className={`relative ${height} flex items-center justify-center overflow-hidden`}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${image})`,
          filter: 'brightness(0.7)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
      
      <div className="relative z-10 container text-center text-white px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default HeroSection;