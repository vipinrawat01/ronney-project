import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, Heart, ShoppingBag } from 'lucide-react';
import { getProducts } from '@/api/EcommerceApi.js';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { useCart } from '@/hooks/useCart.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const CategoryPage = () => {
  const { type, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('-created');
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();

  // Format category names for display
  const displayType = type ? type.charAt(0).toUpperCase() + type.slice(1) : '';
  const displaySubcategory = subcategory 
    ? subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : '';
    
  const pageTitle = displaySubcategory ? `${displaySubcategory} | ${displayType}` : `${displayType} Collection`;

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        const result = await getProducts({
          page: 1,
          perPage: 24,
          type: displayType,
          subcategory: displaySubcategory || undefined,
        });
        
        setProducts(result?.products || []);
      } catch (err) {
        console.error('Error fetching category products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [type, subcategory, displayType, displaySubcategory, sortOption]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to first variant if available, or just product
    const variant = product.variants?.[0] || null;
    addToCart(product, variant, 1, variant?.inventory_quantity || 99);
    toast.success(`Added ${product.name || product.title} to cart`);
  };

  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-24">
      <Helmet><title>{pageTitle} | Alliraa Textile</title></Helmet>
      
      {/* Category Hero */}
      <div className="bg-muted py-16 mb-12">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4 uppercase tracking-widest">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link to={`/category/${type}`} className="hover:text-primary transition-colors">{displayType}</Link>
            {displaySubcategory && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">{displaySubcategory}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">{displaySubcategory || displayType}</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of premium {displaySubcategory ? displaySubcategory.toLowerCase() : displayType.toLowerCase()}, crafted with exceptional attention to detail and sustainable materials.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">
            Showing {products.length} results
          </p>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 border border-border hover:bg-accent transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            
            <div className="relative flex-grow md:flex-grow-0">
              <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full appearance-none px-4 py-2 pr-10 border border-border bg-background text-sm font-medium focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="-created">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-revenue">Best Sellers</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={`skeleton-${i}`} className="flex flex-col">
                <Skeleton className="w-full aspect-[3/4] mb-4 rounded-none" />
                <Skeleton className="h-5 w-2/3 mb-2 rounded-none" />
                <Skeleton className="h-4 w-1/4 rounded-none" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, idx) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }} 
                className="group flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-muted mb-4">
                  {product.images?.[0]?.url || product.image ? (
                    <img 
                      src={product.image || product.images?.[0]?.url || ''} 
                      alt={product.title || product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">
                      No Image
                    </div>
                  )}
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent flex justify-center gap-2">
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      className="bg-background text-foreground p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => toggleWishlist(e, product)}
                      className="bg-background text-foreground p-3 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors shadow-lg"
                      aria-label="Toggle wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>
                </Link>
                
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm uppercase tracking-widest font-semibold hover:text-primary transition-colors line-clamp-1">
                    <Link to={`/product/${product.id}`}>
                      {product.title || product.name}
                    </Link>
                  </h3>
                  <span className="text-sm font-medium text-muted-foreground">
                    {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : '$'}
                    {product.price_in_cents ? (product.price_in_cents / 100).toFixed(2) : (product.price?.toFixed(2) || '0.00')}
                  </span>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-muted/30 border border-border">
              <p className="text-muted-foreground text-lg mb-4 font-serif">No products found in this category.</p>
              <Link to="/shop" className="luxury-button luxury-button-outline">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;