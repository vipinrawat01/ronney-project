import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/hooks/useCart.jsx';
import { WishlistProvider } from '@/contexts/WishlistContext.jsx';
import { BrandingProvider } from '@/contexts/BrandingContext.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import ProtectedAdminRoute from '@/components/ProtectedAdminRoute.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';

// Public Pages
import HomePage from '@/pages/HomePage.jsx';
import CategoriesIndexPage from '@/pages/CategoriesIndexPage.jsx';
import CategoryImmersivePage from '@/pages/CategoryImmersivePage.jsx';
import CategoryPage from '@/pages/CategoryPage.jsx';
import ProductDetailPage from '@/pages/ProductDetailPage.jsx';
import ProductStore from '@/pages/ProductStore.jsx';
import ShoppingCart from '@/pages/ShoppingCart.jsx';
import Wishlist from '@/pages/Wishlist.jsx';
import AboutPage from '@/pages/AboutPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';
import LoginPage from '@/pages/LoginPage.jsx';

// Protected User Pages
import CheckoutPage from '@/pages/CheckoutPage.jsx';
import UserProfile from '@/pages/UserProfile.jsx';
import OrderHistory from '@/pages/OrderHistory.jsx';

// Admin Layout & Pages
import AdminLayout from '@/pages/admin/AdminLayout.jsx';
import DashboardOverview from '@/pages/admin/DashboardOverview.jsx';
import ProductManagement from '@/pages/admin/ProductManagement.jsx';
import CategoryManagement from '@/pages/admin/CategoryManagement.jsx';
import BrandingManagement from '@/pages/admin/BrandingManagement.jsx';
import OrderManagement from '@/pages/admin/OrderManagement.jsx';
import CustomerManagement from '@/pages/admin/CustomerManagement.jsx';
import InventoryManagement from '@/pages/admin/InventoryManagement.jsx';
import SettingsPage from '@/pages/admin/SettingsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Admin Routes - without standard Header/Footer */}
                <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="products" element={<ProductManagement />} />
                  <Route path="categories" element={<CategoryManagement />} />
                  <Route path="branding" element={<BrandingManagement />} />
                  <Route path="orders" element={<OrderManagement />} />
                  <Route path="customers" element={<CustomerManagement />} />
                  <Route path="inventory" element={<InventoryManagement />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>

                {/* Immersive category — no site header/footer */}
                <Route path="/category/view/:id" element={<CategoryImmersivePage />} />

                {/* Public & User Routes - with standard Header/Footer */}
                <Route path="*" element={
                  <div className="flex flex-col min-h-screen bg-background text-foreground">
                    <Header />
                    <main className="flex-grow flex flex-col">
                      <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/shop" element={<ProductStore />} />
                        <Route path="/category" element={<CategoriesIndexPage />} />

                        {/* Legacy typed category product grids */}
                        <Route path="/category/:type" element={<CategoryPage />} />
                        <Route path="/category/:type/:subcategory" element={<CategoryPage />} />

                        <Route path="/product/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<ShoppingCart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/login" element={<LoginPage />} />

                        {/* Protected User Routes */}
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

                        <Route path="*" element={
                          <div className="min-h-[60vh] flex flex-col items-center justify-center pt-32 text-center px-4">
                            <h1 className="text-6xl font-serif mb-4 text-primary">404</h1>
                            <h2 className="text-2xl font-serif mb-6">Page Not Found</h2>
                            <p className="text-muted-foreground mb-8 max-w-md">The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                            <a href="/" className="luxury-button luxury-button-primary">Return Home</a>
                          </div>
                        } />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />
              </Routes>
              <Toaster position="bottom-center" className="rounded-none bg-background text-foreground border-border" />
            </Router>
          </WishlistProvider>
        </CartProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
