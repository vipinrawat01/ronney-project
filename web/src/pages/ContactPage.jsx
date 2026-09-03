import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const ContactPage = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Inquiry received. Our concierge will be in touch shortly.');
    reset();
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet>
        <title>Contact Us | Alliraa Textile</title>
        <meta name="description" content="Get in touch with the Alliraa Textile team for inquiries, bespoke requests, or support." />
      </Helmet>

      <div className="container max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="mb-6">Client Concierge</h1>
          <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
            We invite you to reach out regarding our collections, sizing advice, or bespoke tailoring services.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Contact Info & Socials */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-12"
          >
            <div>
              <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 text-foreground border-b border-border pb-4">Direct Contact</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="block font-medium text-foreground">Email</span>
                    <a href="mailto:concierge@alliraa.com" className="text-muted-foreground hover:text-primary transition-colors">concierge@alliraa.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="block font-medium text-foreground">Phone</span>
                    <a href="tel:+12125550199" className="text-muted-foreground hover:text-primary transition-colors">+1 (212) 555-0199</a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <span className="block font-medium text-foreground">Atelier</span>
                    <p className="text-muted-foreground">123 Artisan Way<br/>Design District<br/>New York, NY 10001</p>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-widest font-semibold mb-6 text-foreground border-b border-border pb-4">Follow Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border rounded-full text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border rounded-full text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center border border-border rounded-full text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-8 bg-card p-8 md:p-12 border border-border"
          >
            <h2 className="text-3xl mb-8 font-serif">Send an Inquiry</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    placeholder="Jane Doe"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <input 
                    type="email" 
                    className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    placeholder="jane@example.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                    })}
                  />
                  {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject</label>
                  <input 
                    type="text" 
                    className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    placeholder="Order status"
                    {...register('subject', { required: 'Subject is required' })}
                  />
                  {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Product Interest</label>
                  <select 
                    className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                    {...register('inquiryType')}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Kimono">Kimono Collection</option>
                    <option value="Boho Maxi">Boho Maxi Dresses</option>
                    <option value="Floral Dress">Floral Dresses</option>
                    <option value="Tote Bag">Tote Bags</option>
                    <option value="Pouch Bag">Pouch Bags</option>
                    <option value="Bespoke">Bespoke Customization</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea 
                  rows={5}
                  className="w-full bg-background border border-border px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                  placeholder="How can we assist you?"
                  {...register('message', { required: 'Message is required' })}
                ></textarea>
                {errors.message && <p className="text-destructive text-sm mt-1">{errors.message.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full luxury-button luxury-button-primary disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Submit Inquiry'}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
      
      {/* Newsletter Section */}
      <section className="mt-32 bg-foreground text-background py-24">
        <div className="container max-w-3xl text-center">
          <h2 className="mb-6">The Alliraa Journal</h2>
          <p className="text-background/70 mb-10 text-lg font-light">
            Subscribe to receive exclusive access to private sales, early releases, and editorial content.
          </p>
          <form className="flex flex-col sm:flex-row max-w-xl mx-auto gap-4" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed successfully.'); }}>
            <input 
              type="email" 
              placeholder="Email address" 
              className="flex-grow bg-transparent border-b border-background/30 px-4 py-3 focus:outline-none focus:border-primary text-background placeholder:text-background/40"
              required
            />
            <button type="submit" className="text-sm font-semibold tracking-widest uppercase text-primary hover:text-white transition-colors py-3 px-6 sm:px-0">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;