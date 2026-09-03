import React from 'react';
import { Helmet } from 'react-helmet';
import ShopByCategoryCarousel from '@/components/ShopByCategoryCarousel.jsx';

const CategoriesIndexPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <Helmet>
        <title>Categories | Alliraa Textile</title>
      </Helmet>
      <ShopByCategoryCarousel headingAs="h1" className="pt-4 pb-8" />
    </div>
  );
};

export default CategoriesIndexPage;
