import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState(() => {
    try {
      const item = window.localStorage.getItem('alliraa_wishlist');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading wishlist from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('alliraa_wishlist', JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to localStorage', error);
    }
  }, [wishlistItems]);

  const addToWishlist = (product) => {
    setWishlistItems((prev) => {
      if (prev.find((item) => item.id === product.id)) {
        toast.info(`${product.name} is already in your wishlist`);
        return prev;
      }
      toast.success(`${product.name} added to wishlist`);
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    toast.success('Item removed from wishlist');
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};