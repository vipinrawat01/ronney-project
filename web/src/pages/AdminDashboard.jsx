import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const records = await pb.collection('products').getFullList({ sort: '-created', $autoCancel: false });
      setProducts(records);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <Helmet><title>Admin Dashboard | Alliraa</title></Helmet>
      <div className="container max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl">Dashboard</h1>
          <Button className="rounded-none uppercase tracking-widest">Add Product</Button>
        </div>
        <div className="bg-card border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary border-b">
              <tr>
                <th className="px-6 py-4 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? <tr><td colSpan="3" className="p-6 text-center">Loading...</td></tr> : 
                products.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.name}</td>
                    <td className="px-6 py-4">{p.category} / {p.subcategory}</td>
                    <td className="px-6 py-4">${p.price}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;