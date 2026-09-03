import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Search, Heart, AlertCircle } from 'lucide-react';
import { getProducts } from '@/api/EcommerceApi.js';
import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import pb from '@/lib/pocketbaseClient.js';

const ProductStore = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState('-created');
  
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let filterStr = '';
        if (categoryFilter !== 'all') {
          filterStr = `category = "${categoryFilter}"`;
        }
        if (searchTerm) {
          const searchFilter = `name ~ "${searchTerm}" || description ~ "${searchTerm}"`;
          filterStr = filterStr ? `${filterStr} && (${searchFilter})` : searchFilter;
        }

        const result = await getProducts({
          page: 1,
          perPage: 50,
          filter: filterStr,
          sort: sortOption
        });
        
        // Safety check: ensure we set an array even if the response is malformed
        setProducts(result?.products || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('We encountered an error while loading our collection. Please try again.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter, sortOption]);

  const toggleWishlist = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>Shop Collection | Alliraa Textile</title></Helmet>
      
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b border-border pb-6">
          <div>
            <h1 className="text-4xl font-serif mb-2">The Collection</h1>
            <p className="text-muted-foreground">Explore our complete range of premium textiles.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary w-full sm:w-64"
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            >
              <option value="all">All Categories</option>
              <option value="Women">Women</option>
              <option value="Men">Men</option>
            </select>
            
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-4 py-2 border border-border bg-background text-foreground text-sm focus:outline-none focus:border-primary"
            >
              <option value="-created">Newest Arrivals</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-revenue">Best Sellers</option>
            </select>
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
          ) : error ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card border border-border">
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <h2 className="text-xl font-serif mb-2">Unable to Load Collection</h2>
              <p className="text-muted-foreground">{error}</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setSortOption('-created');
                }}
                className="mt-6 luxury-button luxury-button-outline"
              >
                Reset Filters & Retry
              </button>
            </div>
          ) : products?.length > 0 ? (
            products.map((product, idx) => (
              <motion.div 
                key={product.id || idx} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.05 }} 
                className="group flex flex-col"
              >
                <Link to={`/product/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-accent mb-4">
                  {product.images?.[0]?.url || product.image ? (
                    <img 
                      src={product.image || product.images?.[0]?.url || ''} 
                      alt={product.title || product.name || 'Product Image'} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm uppercase tracking-widest">
                      No Image
                    </div>
                  )}
                  <button 
                    onClick={(e) => toggleWishlist(e, product)}
                    className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:text-primary focus:opacity-100 focus:outline-none"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-4 h-4 transition-colors ${isInWishlist(product.id) ? 'fill-primary text-primary' : 'text-foreground'}`} />
                  </button>
                </Link>
                <div className="flex justify-between items-start gap-4">
                  <h3 className="text-sm uppercase tracking-widest font-semibold hover:text-primary transition-colors line-clamp-1">
                    <Link to={`/product/${product.id}`}>
                      {product.title || product.name || 'Unnamed Product'}
                    </Link>
                  </h3>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {product.currency === 'USD' ? '$' : product.currency === 'EUR' ? '€' : ''}
                    {product.price_in_cents ? (product.price_in_cents / 100).toFixed(2) : (product.price?.toFixed(2) || '0.00')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 capitalize">
                  {product.type?.value || product.category || 'Collection'}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-card border border-border">
              <p className="text-muted-foreground text-lg mb-4">No products found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm(''); 
                  setCategoryFilter('all');
                }} 
                className="text-primary font-medium hover:underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductStore;