import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, { size: product.sizes?.[0] || null }, 1);
    removeFromWishlist(product.id);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex flex-col items-center justify-center">
        <Helmet><title>Wishlist | Alliraa Textile</title></Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif mb-4">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-8">Save your favorite pieces here to review them later.</p>
          <Link to="/shop" className="luxury-button luxury-button-primary w-full">
            Explore Collection
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>Wishlist | Alliraa Textile</title></Helmet>
      <div className="container">
        <div className="flex justify-between items-end mb-10">
          <h1 className="text-4xl font-serif">Your Wishlist</h1>
          <span className="text-muted-foreground font-medium">{wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlistItems.map((product, index) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col bg-card border border-border p-4"
            >
              <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden bg-accent mb-4 block">
                {product.images?.[0] ? (
                  <img src={pb.files.getURL(product, product.images[0], { thumb: '400x500' })} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No Image</div>
                )}
              </Link>
              
              <div className="flex flex-col flex-grow">
                <Link to={`/product/${product.id}`} className="text-sm font-semibold uppercase tracking-wide hover:text-primary transition-colors mb-1 line-clamp-1">
                  {product.name}
                </Link>
                <p className="text-muted-foreground text-sm mb-4">${product.price?.toFixed(2)}</p>
                
                <div className="mt-auto flex gap-2">
                  <Button 
                    onClick={() => handleMoveToCart(product)}
                    className="flex-1 rounded-none text-xs uppercase tracking-widest"
                  >
                    <ShoppingCart className="w-3 h-3 mr-2" /> Add to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => removeFromWishlist(product.id)}
                    className="rounded-none border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;