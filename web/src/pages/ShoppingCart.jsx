import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart.jsx';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';

const ShoppingCart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const navigate = useNavigate();

  const subtotal = Number(getCartTotal()) || 0;
  const tax = subtotal * 0.08; // 8% tax
  const shipping = subtotal > 200 ? 0 : 15; // Free shipping over $200
  const total = subtotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 flex flex-col items-center justify-center">
        <Helmet><title>Shopping Cart | Alliraa Textile</title></Helmet>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-serif mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any items to your cart yet. Discover our latest collections.</p>
          <Link to="/shop" className="luxury-button luxury-button-primary w-full">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>Shopping Cart | Alliraa Textile</title></Helmet>
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-serif mb-10">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item, index) => (
              <motion.div 
                key={`${item.id}-${item.variant?.size || 'default'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row gap-6 p-6 bg-card border border-border"
              >
                <Link to={`/product/${item.id}`} className="w-full sm:w-32 aspect-[3/4] bg-accent shrink-0 block">
                  {item.images?.[0] ? (
                    <img src={pb.files.getURL(item, item.images[0], { thumb: '200x300' })} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
                  )}
                </Link>
                
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link to={`/product/${item.id}`} className="text-lg font-serif font-semibold hover:text-primary transition-colors">
                        {item.name}
                      </Link>
                      {item.variant?.size && <p className="text-sm text-muted-foreground mt-1">Size: {item.variant.size}</p>}
                    </div>
                    <p className="font-medium">${item.price?.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center border border-border">
                      <button 
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                        className="p-2 hover:bg-accent transition-colors text-foreground"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                        className="p-2 hover:bg-accent transition-colors text-foreground"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id, item.variant)}
                      className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-8 sticky top-32">
              <h2 className="text-xl font-serif font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (8%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              
              <div className="border-t border-border pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-serif font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/checkout')}
                className="w-full py-6 text-sm uppercase tracking-widest font-semibold rounded-none group"
              >
                Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <div className="mt-6 text-center">
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;