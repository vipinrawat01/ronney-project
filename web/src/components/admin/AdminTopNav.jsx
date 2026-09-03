import React from 'react';
import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AdminTopNav = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-foreground"><Menu /></button>
        <span className="font-serif tracking-widest uppercase font-semibold">Alliraa Admin</span>
      </div>
      <div className="hidden lg:block text-sm text-muted-foreground uppercase tracking-widest">
        Dashboard Overview
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm font-medium focus:outline-none">
            <UserCircle className="w-6 h-6 text-muted-foreground" />
            <span className="hidden sm:inline">{currentUser?.name || 'Administrator'}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminTopNav;