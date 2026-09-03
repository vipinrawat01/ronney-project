import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderTree, ShoppingCart, Users, PackageOpen, Settings, Palette } from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: ShoppingBag },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Branding', path: '/admin/branding', icon: Palette },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Inventory', path: '/admin/inventory', icon: PackageOpen },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen hidden lg:block sticky top-0 h-screen overflow-y-auto">
      <div className="p-6 border-b border-border">
        <Link to="/" className="text-2xl font-serif tracking-widest uppercase">Alliraa Admin</Link>
      </div>
      <nav className="p-4 space-y-2">
        {links.map(link => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
            >
              <Icon size={18} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;