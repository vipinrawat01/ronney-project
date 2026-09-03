import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import ProductCard from '@/components/ProductCard.jsx';
import { Skeleton } from '@/components/ui/skeleton';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const records = await pb.collection('products').getFullList({
          sort: '-created',
          $autoCancel: false
        });
        setProducts(records);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-32">
      <Helmet>
        <title>Shop Collection | Alliraa Textile</title>
        <meta name="description" content="Browse our complete collection of premium handcrafted textiles." />
      </Helmet>

      <div className="container">
        <div className="max-w-3xl mb-16">
          <h1 className="mb-6">The Collection</h1>
          <p className="text-xl text-muted-foreground font-light">
            Thoughtfully designed pieces crafted from premium natural fibers.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-6 w-2/3 rounded-none" />
                <Skeleton className="h-5 w-1/3 rounded-none" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-secondary">
            <h3 className="mb-4">No products found</h3>
            <p className="text-muted-foreground">Check back soon for our new collection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;