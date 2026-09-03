import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Package, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      pb.collection('orders').getFullList({
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      })
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>Order History | Alliraa Textile</title></Helmet>
      <div className="container max-w-5xl">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary transition-colors">My Account</Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">Orders</span>
        </div>
        
        <h1 className="text-4xl font-serif mb-10">Order History</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-none" />)}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-card border border-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-semibold mb-1">{order.orderNumber}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Placed on {new Date(order.created).toLocaleDateString()}</p>
                    <span className={`text-xs uppercase tracking-widest px-3 py-1 font-medium ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-accent text-foreground'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                  <p className="text-xl font-serif font-bold">${order.total_amount?.toFixed(2)}</p>
                  <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    View Details <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-card border border-border">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-serif mb-2">No Orders Yet</h2>
            <p className="text-muted-foreground mb-6">You haven't placed any orders with us.</p>
            <Link to="/shop" className="luxury-button luxury-button-primary">Start Shopping</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;