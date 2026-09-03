import React, { useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    pb.collection('inventory').getFullList({ expand: 'product_id', sort: '-created', $autoCancel: false }).then(setInventory).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif mb-6">Inventory</h1>
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>In Stock</TableHead>
              <TableHead>Reorder Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.expand?.product_id?.name || 'Unknown'}</TableCell>
                <TableCell className={i.quantity_in_stock <= i.reorder_level ? 'text-destructive font-bold' : ''}>{i.quantity_in_stock}</TableCell>
                <TableCell>{i.reorder_level}</TableCell>
              </TableRow>
            ))}
            {inventory.length === 0 && <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No inventory records found.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InventoryManagement;