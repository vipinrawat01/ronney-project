import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { User, MapPin, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import pb from '@/lib/pocketbaseClient.js';

const UserProfile = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    if (currentUser) {
      pb.collection('orders').getList(1, 5, {
        filter: `userId = "${currentUser.id}"`,
        sort: '-created',
        $autoCancel: false
      }).then(res => setRecentOrders(res.items)).catch(console.error);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <Helmet><title>My Account | Alliraa Textile</title></Helmet>
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-serif mb-10">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-foreground text-background' : 'bg-card text-foreground hover:bg-accent'}`}>
              <User className="w-4 h-4" /> Personal Info
            </button>
            <Link to="/orders" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-card text-foreground hover:bg-accent transition-colors">
              <ShoppingBag className="w-4 h-4" /> Order History
            </Link>
            <Link to="/wishlist" className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium bg-card text-foreground hover:bg-accent transition-colors">
              <Heart className="w-4 h-4" /> Wishlist
            </Link>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-8">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-card border border-border p-8">
                <h2 className="text-2xl font-serif mb-6">Personal Information</h2>
                <div className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                    <p className="text-lg font-medium">{currentUser.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                    <p className="text-lg font-medium">{currentUser.email}</p>
                  </div>
                  <Button variant="outline" className="rounded-none uppercase tracking-widest text-xs">Edit Profile</Button>
                </div>

                <h2 className="text-2xl font-serif mb-6 mt-12">Recent Orders</h2>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex justify-between items-center p-4 border border-border">
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.created).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${order.total_amount?.toFixed(2)}</p>
                          <span className="text-xs uppercase tracking-widest px-2 py-1 bg-accent text-foreground">{order.order_status}</span>
                        </div>
                      </div>
                    ))}
                    <Link to="/orders" className="inline-block mt-4 text-sm font-medium text-primary hover:underline">View all orders</Link>
                  </div>
                ) : (
                  <p className="text-muted-foreground">You haven't placed any orders yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;