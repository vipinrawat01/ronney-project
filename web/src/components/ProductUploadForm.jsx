import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import { ChevronDown, ChevronUp, ImagePlus } from 'lucide-react';

const STYLE_OPTIONS = ['Kimono', 'Boho Maxi', 'PJ Set', 'Tote Bag', 'Pouch Bag', 'Floral Dress'];

const ProductUploadForm = ({ onSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fabricDetails: '',
    price: '',
    availableStyles: []
  });

  const handleStyleToggle = (style) => {
    setFormData(prev => {
      const styles = prev.availableStyles.includes(style)
        ? prev.availableStyles.filter(s => s !== style)
        : [...prev.availableStyles, style];
      return { ...prev, availableStyles: styles };
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    
    // Create previews
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      fabricDetails: '',
      price: '',
      availableStyles: []
    });
    setFiles([]);
    setPreviewUrls([]);
    document.getElementById('images-upload').value = '';
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

      files.forEach(file => {
        data.append('images', file);
      });

      await pb.collection('products').create(data, { $autoCancel: false });
      
      toast.success('Product uploaded successfully');
      resetForm();
      setIsOpen(false);
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to upload product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-secondary mb-16 border border-border">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-black/5 transition-colors"
      >
        <span className="font-serif text-xl">Admin: Add New Product</span>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="p-6 border-t border-border space-y-8 bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="uppercase tracking-wider text-xs">Product Name</Label>
                <Input 
                  id="name" 
                  required 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="rounded-none border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="uppercase tracking-wider text-xs">Price ($)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  step="0.01" 
                  required 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="rounded-none border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fabricDetails" className="uppercase tracking-wider text-xs">Fabric Details</Label>
                <Input 
                  id="fabricDetails" 
                  value={formData.fabricDetails}
                  onChange={e => setFormData({...formData, fabricDetails: e.target.value})}
                  placeholder="e.g., 100% Organic Linen"
                  className="rounded-none border-border"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs">Category / Style</Label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {STYLE_OPTIONS.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleStyleToggle(style)}
                      className={`px-4 py-2 text-sm border transition-colors rounded-none ${
                        formData.availableStyles.includes(style) 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background hover:bg-secondary border-border'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="uppercase tracking-wider text-xs">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="rounded-none border-border resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images-upload" className="uppercase tracking-wider text-xs block mb-2">Product Images</Label>
                <div className="border-2 border-dashed border-border p-6 text-center cursor-pointer hover:bg-secondary transition-colors relative">
                  <input 
                    id="images-upload" 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click or drag images to upload</span>
                </div>
                
                {previewUrls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-4">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative w-20 h-20 flex-shrink-0 bg-secondary">
                        <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-border gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="rounded-none uppercase tracking-widest text-xs"
              disabled={isSubmitting}
            >
              Clear
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="rounded-none uppercase tracking-widest text-xs px-8"
            >
              {isSubmitting ? 'Uploading...' : 'Publish Product'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductUploadForm;