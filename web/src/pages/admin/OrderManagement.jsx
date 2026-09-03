import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    pb.collection('orders').getFullList({ sort: '-created', $autoCancel: false }).then(setOrders).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Orders</h1>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell className="font-medium font-mono text-xs">{o.id}</TableCell>
                <TableCell>{o.customer_name}</TableCell>
                <TableCell><span className="capitalize px-2 py-1 bg-muted rounded-full text-xs">{o.order_status || 'Pending'}</span></TableCell>
                <TableCell>${o.total_amount?.toFixed(2)}</TableCell>
              </TableRow>
            ))}
            {orders.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No orders found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderManagement;