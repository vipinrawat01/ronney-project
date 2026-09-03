import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent successfully. We will be in touch soon.');
    setFormData({ name: '', email: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          required 
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
          className="bg-transparent border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          placeholder="Jane Doe"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          required 
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
          className="bg-transparent border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
          placeholder="jane@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea 
          id="message" 
          required 
          value={formData.message}
          onChange={e => setFormData({...formData, message: e.target.value})}
          className="bg-transparent border-b border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary min-h-[120px] resize-none"
          placeholder="How can we help you?"
        />
      </div>
      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full md:w-auto px-8 py-6 text-base uppercase tracking-wider"
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
};

export default ContactForm;