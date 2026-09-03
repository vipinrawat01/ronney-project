import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
// import { Menu, Search, Heart, User, X, ShoppingBag, LayoutDashboard, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
// import { useAuth } from '@/contexts/AuthContext.jsx';
// import { useCart } from '@/hooks/useCart.jsx';
// import { useWishlist } from '@/contexts/WishlistContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranding } from '@/contexts/BrandingContext.jsx';

const navigationLinks = [
  // { name: 'Home', path: '/' },
  // {
  //   name: 'Men',
  //   path: '/category/men',
  //   subItems: [
  //     { name: 'Shirts', path: '/category/men/shirts' },
  //     { name: 'T-Shirts', path: '/category/men/t-shirts' },
  //     { name: 'Kurtas', path: '/category/men/kurtas' },
  //     { name: 'Co-ord Sets', path: '/category/men/coord-sets' },
  //     { name: 'Bottom Wear', path: '/category/men/bottom-wear' },
  //   ]
  // },
  // {
  //   name: 'Women',
  //   path: '/category/women',
  //   subItems: [
  //     { name: 'Kimono Dresses', path: '/category/women/kimono-dresses' },
  //     { name: 'Floral Dresses', path: '/category/women/floral-dresses' },
  //     { name: 'Boho Maxi Dresses', path: '/category/women/boho-maxi-dresses' },
  //     { name: 'PJ Sets', path: '/category/women/pj-sets' },
  //     { name: 'Tote Bags', path: '/category/women/tote-bags' },
  //     { name: 'Pouch Bags', path: '/category/women/pouch-bags' },
  //     { name: 'Ethnic Wear', path: '/category/women/ethnic-wear' },
  //   ]
  // },
  // { name: 'Shop', path: '/shop' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { branding } = useBranding();
  const storeName = branding.store_name || 'Alliraa Textile';
  const [nameMain, ...nameRest] = storeName.split(' ');
  const nameAccent = nameRest.join(' ');

  // const { currentUser, isAdmin, logout } = useAuth();
  // const { cartItems } = useCart();
  // const { wishlistCount } = useWishlist();
  // const cartCount = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const isHomePage = location.pathname === '/';
  const headerBg = scrolled
    ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
    : isHomePage
      ? 'bg-background/40 backdrop-blur-sm'
      : 'bg-transparent';
  const textColorClass = 'text-foreground';
  const hoverColorClass = 'hover:text-primary';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg} py-4`}>
      <nav className="container">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className={`text-2xl md:text-3xl font-serif tracking-widest uppercase font-bold ${textColorClass} transition-colors duration-300 z-50 flex items-center gap-3`}>
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={storeName} className="h-9 md:h-10 w-auto object-contain" />
            ) : (
              <>
                {nameMain}{nameAccent ? <span className="font-accent text-primary italic lowercase text-xl md:text-2xl tracking-normal"> {nameAccent}</span> : null}
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationLinks.map((link) => (
              <div key={link.name} className="relative" onMouseEnter={() => setActiveDropdown(link.name)} onMouseLeave={() => setActiveDropdown(null)}>
                <Link to={link.path} className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-bold transition-colors duration-300 ${isActive(link.path) ? 'text-primary' : `${textColorClass} ${hoverColorClass}`}`}>
                  {link.name}
                </Link>
                {link.subItems && (
                  <AnimatePresence>
                    {activeDropdown === link.name && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: 10 }} 
                        transition={{ duration: 0.2 }} 
                        className="absolute top-full left-0 pt-4"
                      >
                        <div className="bg-background border border-border shadow-2xl p-6 min-w-[220px] flex flex-col gap-3">
                          {link.subItems.map((sub) => (
                            <Link key={sub.name} to={sub.path} className="text-sm font-medium text-foreground hover:text-primary hover:translate-x-1 transition-all duration-300" onClick={() => setActiveDropdown(null)}>
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          {/* Icons — search, wishlist, cart, login hidden */}
          {/* <div className="hidden lg:flex items-center gap-6">
            <button className={`${textColorClass} ${hoverColorClass} transition-colors focus:outline-none`} aria-label="Search">
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <Link to="/wishlist" className={`relative ${textColorClass} ${hoverColorClass} transition-colors`}>
              <Heart className="w-5 h-5" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className={`relative ${textColorClass} ${hoverColorClass} transition-colors`}>
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className={`${textColorClass} ${hoverColorClass} transition-colors focus:outline-none`}>
                <User className="w-5 h-5" strokeWidth={1.5} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background border-border rounded-none shadow-xl">
                {currentUser ? (
                  <>
                    <div className="px-4 py-3 text-sm font-medium text-foreground border-b border-border mb-1 bg-muted/30">
                      Welcome, {currentUser.name || currentUser.email.split('@')[0]}
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex items-center font-medium text-foreground py-2 px-4 hover:bg-accent hover:text-accent-foreground">
                        <User className="mr-3 h-4 w-4" /> My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orders" className="cursor-pointer flex items-center font-medium text-foreground py-2 px-4 hover:bg-accent hover:text-accent-foreground">
                        <ShoppingBag className="mr-3 h-4 w-4" /> Order History
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer flex items-center font-medium text-primary py-2 px-4 hover:bg-primary/10">
                          <LayoutDashboard className="mr-3 h-4 w-4" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive font-medium py-2 px-4 hover:bg-destructive/10">
                      <LogOut className="mr-3 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/login" className="cursor-pointer font-medium text-foreground py-2 px-4 hover:bg-accent hover:text-accent-foreground">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/register" className="cursor-pointer font-medium text-foreground py-2 px-4 hover:bg-accent hover:text-accent-foreground">Create Account</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}

          {/* Mobile Menu Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button className={`p-2 -mr-2 ${textColorClass}`}>
                <Menu className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] bg-background border-l-0 p-0 overflow-y-auto">
              <div className="flex flex-col min-h-full p-8 pt-20 relative">
                <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-foreground">
                  <X className="w-8 h-8" strokeWidth={1} />
                </button>
                
                {/* Cart / wishlist hidden
                <div className="flex gap-6 mb-8 border-b border-border pb-6">
                  <Link to="/cart" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-foreground font-medium">
                    <ShoppingBag className="w-5 h-5" /> Cart ({cartCount})
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-2 text-foreground font-medium">
                    <Heart className="w-5 h-5" /> Wishlist ({wishlistCount})
                  </Link>
                </div>
                */}

                <div className="flex flex-col gap-6">
                  {navigationLinks.map((link) => (
                    <div key={link.name} className="flex flex-col">
                      <Link to={link.path} onClick={() => setIsOpen(false)} className={`text-2xl font-serif font-bold transition-colors duration-300 ${isActive(link.path) ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                        {link.name}
                      </Link>
                      {link.subItems && (
                        <div className="flex flex-col gap-3 pl-4 mt-4 border-l border-border">
                          {link.subItems.map((sub) => (
                            <Link key={sub.name} to={sub.path} onClick={() => setIsOpen(false)} className="text-lg font-medium text-muted-foreground hover:text-primary">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Login / profile hidden
                <div className="mt-auto pt-8 border-t border-border flex flex-col gap-4">
                  {currentUser ? (
                    <>
                      <Link to="/profile" onClick={() => setIsOpen(false)} className="text-lg font-medium text-foreground">My Profile</Link>
                      <Link to="/orders" onClick={() => setIsOpen(false)} className="text-lg font-medium text-foreground">My Orders</Link>
                      {isAdmin && <Link to="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium text-primary">Admin Dashboard</Link>}
                      <button onClick={() => { logout(); setIsOpen(false); }} className="text-lg font-medium text-left text-destructive">Logout</button>
                    </>
                  ) : (
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg font-medium text-foreground">Login / Register</Link>
                  )}
                </div>
                */}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export default Header;