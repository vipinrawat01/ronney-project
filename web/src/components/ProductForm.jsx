import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { X } from 'lucide-react';

const STYLE_OPTIONS = ['Kimono', 'Boho Maxi', 'PJ Set', 'Tote Bag', 'Pouch Bag', 'Floral Dress'];

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fabricDetails: '',
    price: '',
    availableStyles: []
  });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        fabricDetails: product.fabricDetails || '',
        price: product.price || '',
        availableStyles: product.availableStyles || []
      });
    }
  }, [product]);

  const handleStyleToggle = (style) => {
    setFormData(prev => {
      const styles = prev.availableStyles.includes(style)
        ? prev.availableStyles.filter(s => s !== style)
        : [...prev.availableStyles, style];
      return { ...prev, availableStyles: styles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('fabricDetails', formData.fabricDetails);
      data.append('price', formData.price);
      
      formData.availableStyles.forEach(style => {
        data.append('availableStyles', style);
      });

      Array.from(files).forEach(file => {
        data.append('images', file);
      });

      if (product?.id) {
        await pb.collection('products').update(product.id, data, { $autoCancel: false });
        toast.success('Product updated successfully');
      } else {
        await pb.collection('products').create(data, { $autoCancel: false });
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">{product ? 'Edit Product' : 'Add New Product'}</h3>
        <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input 
            id="name" 
            required 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price ($) *</Label>
          <Input 
            id="price" 
            type="number" 
            step="0.01" 
            required 
            value={formData.price}
            onChange={e => setFormData({...formData, price: e.target.value})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fabricDetails">Fabric Details</Label>
        <Input 
          id="fabricDetails" 
          value={formData.fabricDetails}
          onChange={e => setFormData({...formData, fabricDetails: e.target.value})}
        />
      </div>

      <div className="space-y-2">
        <Label>Available Styles</Label>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => handleStyleToggle(style)}
              className={`px-3 py-1 text-sm border transition-colors ${
                formData.availableStyles.includes(style) 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-transparent hover:bg-secondary'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Images</Label>
        <Input 
          id="images" 
          type="file" 
          multiple 
          accept="image/*"
          onChange={e => setFiles(e.target.files)}
        />
        <p className="text-xs text-muted-foreground">Select multiple files to upload. Existing images will be kept unless deleted via API.</p>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;