import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const items = [
  { label: 'Floral Dress', path: '/floral-dress' },
  { label: 'Kimono Dress', path: '/kimono-dress' },
  { label: 'PJ Set', path: '/pj-set' },
  { label: 'Boho Maxi', path: '/boho-maxi' },
];

export default function DressDropdown({ isMobile, onLinkClick }) {
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

  const isActive = items.some(item => location.pathname === item.path);

  if (isMobile) {
    return (
      <div className="flex flex-col">
        <button 
          onClick={handleMobileToggle}
          className={`flex items-center justify-between w-full text-3xl font-light tracking-tight transition-colors duration-300 ${
            isActive ? 'text-[hsl(var(--nav-text))]' : 'text-[hsl(var(--nav-hover))] hover:text-[hsl(var(--nav-text))]'
          }`}
        >
          Dress
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
              <div className="flex flex-col gap-4 pt-4 pl-4 pb-2">
                {items.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={handleItemClick}
                    className="text-xl font-light text-[hsl(var(--nav-hover))] hover:text-[hsl(var(--nav-text))] transition-colors duration-200"
                  >
                    {item.label}
                  </Link>
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
      <button 
        className={`flex items-center gap-1 text-sm uppercase tracking-widest transition-colors duration-300 ${
          isActive ? 'text-[hsl(var(--nav-text))] font-semibold' : 'text-[hsl(var(--nav-hover))] hover:text-[hsl(var(--nav-text))]'
        }`}
      >
        Dress
        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-6 z-50 cursor-default"
          >
            <div className="bg-[hsl(var(--nav-bg))] border border-[hsl(var(--nav-border))] shadow-xl p-6 min-w-[200px]">
              <ul className="flex flex-col gap-4">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      onClick={handleItemClick}
                      className="block text-sm text-[hsl(var(--nav-hover))] hover:text-[hsl(var(--nav-text))] hover:translate-x-1 transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}