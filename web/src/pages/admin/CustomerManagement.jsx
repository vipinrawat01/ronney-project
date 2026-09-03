import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    pb.collection('customers').getFullList({ sort: '-created', $autoCancel: false }).then(setCustomers).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Customers</h1>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>${c.total_spent?.toFixed(2) || '0.00'}</TableCell>
              </TableRow>
            ))}
            {customers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No customers found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CustomerManagement;