import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCart } from '@/hooks/useCart.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: currentUser?.email || '',
      name: currentUser?.name || '',
    }
  });

  const subtotal = getCartTotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 200 ? 0 : 15;
  const total = subtotal + tax + shipping;

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const orderData = {
        userId: currentUser.id,
        customer_name: data.name,
        customer_email: data.email,
        customer_phone: data.phone,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        shippingAddress: `${data.address}, ${data.city}, ${data.state} ${data.zip}`,
        billingAddress: useShippingForBilling ? `${data.address}, ${data.city}, ${data.state} ${data.zip}` : `${data.billingAddress}, ${data.billingCity}, ${data.billingState} ${data.billingZip}`,
        subtotal,
        tax,
        shipping,
        total_amount: total,
        order_status: 'pending'
      };

      await pb.collection('orders').create(orderData, { $autoCancel: false });
      clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>Checkout | Alliraa Textile</title></Helmet>
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-serif mb-10">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* Contact Info */}
            <section>
              <h2 className="text-xl font-serif font-semibold mb-6 border-b border-border pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <input 
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                  />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input 
                    {...register('phone', { required: 'Phone is required' })}
                    className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                  />
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-xl font-serif font-semibold mb-6 border-b border-border pb-2">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  <input 
                    {...register('address', { required: 'Address is required' })}
                    className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                  />
                  {errors.address && <p className="text-destructive text-xs mt-1">{errors.address.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input 
                    {...register('city', { required: 'City is required' })}
                    className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                  />
                  {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input 
                      {...register('state', { required: 'State is required' })}
                      className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                    />
                    {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input 
                      {...register('zip', { required: 'ZIP is required' })}
                      className="w-full p-3 border border-border bg-background text-foreground focus:border-primary outline-none"
                    />
                    {errors.zip && <p className="text-destructive text-xs mt-1">{errors.zip.message}</p>}
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-xl font-serif font-semibold mb-6 border-b border-border pb-2">Payment</h2>
              <div className="p-6 border border-border bg-card text-center">
                <p className="text-muted-foreground mb-4">This is a demo environment. No actual payment will be processed.</p>
                <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="payment" value="stripe" defaultChecked className="accent-primary" />
                    <span className="font-medium">Credit Card (Stripe)</span>
                  </label>
                </div>
              </div>
            </section>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border p-8 sticky top-32">
              <h2 className="text-xl font-serif font-semibold mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.variant?.size}`} className="flex justify-between text-sm">
                    <div className="flex gap-3">
                      <span className="text-muted-foreground">{item.quantity}x</span>
                      <span className="font-medium line-clamp-1">{item.name}</span>
                    </div>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 text-sm mb-6 border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
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
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-sm uppercase tracking-widest font-semibold rounded-none"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;