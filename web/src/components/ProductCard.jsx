import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const ProductCard = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0 
    ? pb.files.getUrl(product, product.images[0], { thumb: '600x800' })
    : 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=600&q=80';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="group flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-secondary aspect-[3/4] mb-5 relative">
        <img 
          src={imageUrl} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-sans text-base uppercase tracking-wider font-semibold text-foreground group-hover:text-muted-foreground transition-colors">
            <Link to={`/product/${product.id}`}>{product.name}</Link>
          </h3>
          <span className="text-base" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ${product.price?.toFixed(2)}
          </span>
        </div>
        
        {product.fabricDetails && (
          <p className="text-sm text-muted-foreground capitalize tracking-wide font-light">
            {product.fabricDetails}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const ProductCardSkeleton = () => (
  <div className="flex flex-col">
    <Skeleton className="w-full aspect-[3/4] mb-5 rounded-none" />
    <div className="flex justify-between items-start mb-2">
      <Skeleton className="h-5 w-2/3 rounded-none" />
      <Skeleton className="h-5 w-1/4 rounded-none" />
    </div>
    <Skeleton className="h-4 w-1/3 rounded-none" />
  </div>
);

export default ProductCard;