import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const SpecialOffersSection = () => {
  return (
    <section className="py-20 bg-secondary text-secondary-foreground overflow-hidden relative">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="container relative z-10 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto border border-primary/30 p-12 bg-secondary/80 backdrop-blur-sm">
          <span className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 block">Limited Time</span>
          <h2 className="text-4xl md:text-5xl font-serif mb-6 text-white">The Atelier Sale</h2>
          <p className="text-secondary-foreground/80 mb-8 text-lg font-light">Enjoy 20% off selected seasonal pieces. An opportunity to acquire our signature craft at exceptional value.</p>
          <Link to="/shop" className="luxury-button bg-primary text-primary-foreground hover:bg-white hover:text-black">
            Shop The Edit
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;