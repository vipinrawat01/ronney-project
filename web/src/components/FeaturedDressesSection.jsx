import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedDressesSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const records = await pb.collection('products').getList(1, 6, {
          filter: 'availableStyles ~ "Kimono" || availableStyles ~ "Floral Dress" || availableStyles ~ "Boho Maxi"',
          sort: '-created',
          $autoCancel: false
        });
        setProducts(records.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-primary text-sm tracking-widest uppercase font-semibold mb-2 block">Curated Selection</span>
          <h2 className="text-4xl font-serif">Featured Dresses</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-3/4 rounded-none" />
                <Skeleton className="h-4 w-1/4 rounded-none" />
              </div>
            ))
          ) : (
            products.map((product, i) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden mb-6 bg-accent">
                  {product.images?.[0] && (
                    <img 
                      src={pb.files.getURL(product, product.images[0])} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="bg-white text-black px-6 py-3 text-xs uppercase tracking-widest font-semibold">View Details</span>
                  </div>
                </Link>
                <div className="flex flex-col flex-grow text-center">
                  <h3 className="text-lg font-serif mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{product.description}</p>
                  <span className="text-primary font-medium mt-auto">${product.price?.toFixed(2)}</span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDressesSection;