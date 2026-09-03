import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const products = [
  {
    id: 'pr-1',
    category: 'Dresses',
    name: 'The Flowing Kimono',
    description: 'A masterpiece of fluid motion, tailored from organic silk for effortless elegance.',
    image: 'https://images.unsplash.com/photo-1602161761507-aefef28786fa?q=80&w=1000',
    link: '/shop?category=Kimono'
  },
  {
    id: 'pr-2',
    category: 'Dresses',
    name: 'Bohemian Botanical Maxi',
    description: 'Detailed floral motifs on breathable linen, designed for sun-drenched afternoons.',
    image: 'https://images.unsplash.com/photo-1655845622980-ec5167330569?q=80&w=1000',
    link: '/shop?category=Boho Maxi'
  },
  {
    id: 'pr-3',
    category: 'Bags',
    name: 'Structured Carryall Tote',
    description: 'Minimalist architecture meets enduring utility in our signature tote.',
    image: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?q=80&w=1000',
    link: '/shop?category=Tote Bag'
  }
];

const ProductShowcase = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 border-b border-border pb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4">Signature Pieces</h2>
            <p className="text-muted-foreground text-lg max-w-xl font-light">
              Explore the foundations of the Alliraa wardrobe—where form meets uncompromising quality.
            </p>
          </motion.div>
          <Link to="/shop" className="group flex items-center text-sm uppercase tracking-widest font-semibold text-primary hover:text-foreground transition-colors">
            Shop All Signatures <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group flex flex-col"
            >
              <div className="relative overflow-hidden aspect-[3/4] bg-accent mb-6">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <Link 
                    to={product.link}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-black px-8 py-3 uppercase tracking-widest text-xs font-semibold hover:bg-black hover:text-white"
                  >
                    Quick View
                  </Link>
                </div>
              </div>
              <div className="flex flex-col flex-grow">
                <span className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{product.category}</span>
                <h3 className="text-xl font-serif mb-3">{product.name}</h3>
                <p className="text-foreground/70 font-light text-sm mb-6 flex-grow">{product.description}</p>
                <Link to={product.link} className="inline-flex items-center text-sm font-semibold uppercase tracking-widest border-b border-foreground pb-1 self-start hover:text-primary hover:border-primary transition-colors">
                  Discover
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;