import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar.jsx';
import AdminTopNav from '@/components/admin/AdminTopNav.jsx';

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopNav />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;