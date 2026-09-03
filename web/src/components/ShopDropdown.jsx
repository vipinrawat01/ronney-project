import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const categories = [
  {
    title: 'Dress',
    items: [
      { label: 'Floral Dress', path: '/shop?category=Floral Dress' },
      { label: 'Kimono Dress', path: '/shop?category=Kimono' },
      { label: 'PJ Set', path: '/shop?category=PJ Set' },
      { label: 'Boho Maxi', path: '/shop?category=Boho Maxi' },
    ]
  },
  {
    title: 'Bag',
    items: [
      { label: 'Tote Bag', path: '/shop?category=Tote Bag' },
      { label: 'Pouch Bag', path: '/shop?category=Pouch Bag' },
    ]
  }
];

export default function ShopDropdown({ isMobile, onLinkClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleDesktopEnter = () => {
    if (!isMobile) setIsOpen(true);
  };

  const handleDesktopLeave = () => {
    if (!isMobile) setIsOpen(false);
  };

  const handleMobileToggle = () => {
    if (isMobile) setIsOpen(!isOpen);
  };

  const handleItemClick = () => {
    if (isMobile && onLinkClick) {
      onLinkClick();
    } else {
      setIsOpen(false);
    }
  };

  const isActive = location.pathname.startsWith('/shop');

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <button 
          onClick={handleMobileToggle}
          className={`flex items-center justify-between w-full text-3xl font-light tracking-tight transition-colors duration-300 ${
            isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
          }`}
        >
          Shop
          <ChevronDown 
            className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-6 pt-6 pl-4 pb-2">
                {categories.map((category) => (
                  <div key={category.title} className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground">
                      {category.title}
                    </h3>
                    <div className="flex flex-col gap-3 pl-2">
                      {category.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={handleItemClick}
                          className="text-xl font-light text-muted-foreground hover:text-primary transition-colors duration-200"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div 
      className="relative"
      onMouseEnter={handleDesktopEnter}
      onMouseLeave={handleDesktopLeave}
    >
      <Link 
        to="/shop"
        className={`flex items-center gap-1 text-sm uppercase tracking-widest transition-colors duration-300 ${
          isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
        }`}
      >
        Shop
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </Link>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-6 z-50 cursor-default"
          >
            <div className="bg-background border border-border shadow-xl p-8 flex gap-12 min-w-[320px]">
              {categories.map((category) => (
                <div key={category.title} className="flex-1">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4 border-b border-border pb-2">
                    {category.title}
                  </h3>
                  <ul className="flex flex-col gap-3">
                    {category.items.map((item) => (
                      <li key={item.label}>
                        <Link
                          to={item.path}
                          onClick={handleItemClick}
                          className="block text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all duration-200"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}