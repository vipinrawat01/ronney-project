import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const TrendingProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const records = await pb.collection('products').getList(1, 8, {
          sort: '-revenue,-created',
          $autoCancel: false
        });
        setProducts(records.items);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="py-24 bg-accent/30 border-y border-border">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-serif">Trending Now</h2>
            <p className="text-muted-foreground mt-2">Most desired pieces this season.</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold uppercase tracking-widest border-b border-foreground pb-1 hover:text-primary hover:border-primary transition-colors">
            Shop All
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i}><Skeleton className="aspect-[4/5] w-full rounded-none mb-4" /><Skeleton className="h-5 w-2/3 rounded-none mb-2" /><Skeleton className="h-4 w-1/3 rounded-none" /></div>
            ))
          ) : (
            products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group">
                <Link to={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-card mb-4">
                  {i < 2 && <span className="absolute top-4 left-4 z-10 bg-primary text-white text-[10px] uppercase tracking-widest px-2 py-1">Best Seller</span>}
                  {product.images?.[0] && (
                    <img src={pb.files.getURL(product, product.images[0], { thumb: '400x500' })} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </Link>
                <Link to={`/product/${product.id}`} className="block hover:text-primary transition-colors text-sm font-semibold uppercase tracking-wide mb-1 line-clamp-1">{product.name}</Link>
                <p className="text-muted-foreground text-sm">${product.price?.toFixed(2)}</p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingProductsSection;