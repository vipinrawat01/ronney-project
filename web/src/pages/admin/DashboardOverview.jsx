import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Users, DollarSign, Package } from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, customers, orders] = await Promise.all([
          pb.collection('products').getList(1, 1, { $autoCancel: false }),
          pb.collection('customers').getList(1, 1, { $autoCancel: false }),
          pb.collection('orders').getList(1, 1, { $autoCancel: false })
        ]);
        setStats({
          products: products.totalItems,
          customers: customers.totalItems,
          orders: orders.totalItems,
          revenue: 12450.00 // Mock revenue, would calculate from orders in real app
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif mb-6">Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.products}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.customers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.orders}</div></CardContent>
        </Card>
      </div>
      
      <div className="mt-10 bg-card border border-border p-8 rounded-xl text-center">
        <p className="text-muted-foreground">Analytics visualization would render here using Recharts.</p>
      </div>
    </div>
  );
};

export default DashboardOverview;