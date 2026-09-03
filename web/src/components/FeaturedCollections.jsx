import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const collections = [
  {
    id: 'resort',
    title: 'Resort Wear',
    description: 'Lightweight linens and breathable cottons for warmer climates.',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 'lounge',
    title: 'Lounge Sets',
    description: 'Soft structural pieces for home and away.',
    image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=800',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    description: 'Structured totes and minimal pouches.',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800',
    span: 'col-span-1 row-span-1'
  }
];

const FeaturedCollections = () => {
  return (
    <section className="py-24 bg-muted">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-4">Curated Edits</h2>
            <p className="text-muted-foreground text-lg max-w-xl">
              Explore our core categories, designed to blend seamlessly into your daily rotation.
            </p>
          </motion.div>
          <Link to="/shop" className="group flex items-center text-sm uppercase tracking-widest font-semibold hover:text-muted-foreground transition-colors">
            View All Categories <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {collections.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative overflow-hidden bg-background block ${item.span}`}
            >
              <Link to={`/shop?category=${item.id}`} className="absolute inset-0 z-10">
                <span className="sr-only">View {item.title}</span>
              </Link>
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 p-8 text-white pointer-events-none">
                <h3 className="text-2xl mb-2">{item.title}</h3>
                <p className="text-white/80 font-light max-w-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;