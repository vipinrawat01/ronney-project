import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    title: 'Women',
    desc: 'Fluid silhouettes and foundational essentials.',
    image: 'https://images.unsplash.com/photo-1583530738247-444ce8342b9a?q=80&w=1000',
    link: '/category/women'
  },
  {
    title: 'Men',
    desc: 'Refined tailoring and relaxed forms.',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?q=80&w=1000',
    link: '/category/men'
  }
];

const CategoryHighlightsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {categories.map((cat, idx) => (
            <motion.div 
              key={cat.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className={`flex flex-col ${idx === 1 ? 'md:mt-24' : ''}`}
            >
              <Link to={cat.link} className="relative aspect-[4/5] overflow-hidden group mb-8">
                <img src={cat.image} alt={cat.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              </Link>
              <h3 className="text-3xl font-serif mb-3">{cat.title}</h3>
              <p className="text-muted-foreground mb-6">{cat.desc}</p>
              <Link to={cat.link} className="inline-flex items-center text-sm font-semibold uppercase tracking-widest text-foreground hover:text-primary transition-colors">
                Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryHighlightsSection;