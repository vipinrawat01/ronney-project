import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useBranding } from '@/contexts/BrandingContext.jsx';

function Footer() {
  const { isAdmin, logout } = useAuth();
  const { branding } = useBranding();
  const storeName = branding.store_name || 'Alliraa Textile';

  return (
    <footer className="bg-secondary text-secondary-foreground pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link to="/" className="text-3xl font-bold tracking-tight uppercase block mb-6">
              {branding.logo_url ? (
                <img src={branding.logo_url} alt={storeName} className="h-10 w-auto object-contain" />
              ) : (
                storeName.split(' ')[0]
              )}
            </Link>
            <p className="text-primary-foreground/70 max-w-md text-lg font-light">
              Premium handcrafted textiles. Elevating everyday moments with timeless elegance and sustainable craftsmanship.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm uppercase tracking-widest mb-6 font-semibold text-white/60">Explore</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Home</Link></li>
              <li><Link to="/shop" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Shop Collection</Link></li>
              <li><Link to="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm uppercase tracking-widest mb-6 font-semibold text-white/60">Connect</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Instagram</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pinterest</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Journal</a></li>
              <li><a href="mailto:hello@alliraa.com" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">hello@alliraa.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/50">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <Link to="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary-foreground transition-colors">Terms of Service</Link>
            <button onClick={logout} className="hover:text-primary-foreground transition-colors">Logout</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;