import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { motion } from 'framer-motion';

const NewsletterSignup = () => {
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await pb.collection('email_signups').create(data, { $autoCancel: false });
      toast.success('Thank you for subscribing to our journal.');
      reset();
    } catch (err) {
      toast.error('Unable to subscribe at this time. Please try again.');
    }
  };

  return (
    <section className="py-24 bg-accent">
      <div className="container max-w-3xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-serif mb-4">Join The Inner Circle</h2>
          <p className="text-muted-foreground mb-10 text-lg">Subscribe to receive early access to new collections, exclusive events, and styling inspiration.</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <div className="flex-grow">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className={`w-full bg-background border ${errors.email ? 'border-destructive' : 'border-border'} px-6 py-4 text-foreground focus:outline-none focus:border-primary transition-colors`}
                {...register('email', { required: 'Email is required', pattern: /^\S+@\S+$/i })}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-foreground text-background px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {errors.email && <p className="text-destructive text-sm mt-2 text-left max-w-xl mx-auto">{errors.email.message}</p>}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;