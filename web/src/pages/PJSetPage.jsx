import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProductGrid from '@/components/ProductGrid.jsx';

function PJSetPage() {
  const products = [
    {
      title: 'Silk Comfort PJ Set',
      description: 'Pure mulberry silk pajama set with contrast piping. Temperature-regulating and hypoallergenic, this set ensures the most restful sleep.',
      image: 'https://images.unsplash.com/photo-1690558612670-c2eb29cc0386',
      price: 156
    },
    {
      title: 'Linen Sleepwear Collection',
      description: 'Breathable European linen pajama set in soft, pre-washed fabric. Features relaxed fit and button-front top for classic comfort.',
      image: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221',
      price: 112
    },
    {
      title: 'Luxury Cotton PJ Set',
      description: 'Premium long-staple cotton pajamas with subtle stripe pattern. Soft, durable, and gets better with every wash.',
      image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633',
      price: 89
    }
  ];

  return (
    <>
      <Helmet>
        <title>PJ Set Collection - Alliraa Textile</title>
        <meta name="description" content="Discover our luxury pajama sets crafted from premium silk, linen, and cotton for ultimate comfort." />
      </Helmet>

      <Header />

      <main>
        <HeroSection
          image="https://images.unsplash.com/photo-1690558612670-c2eb29cc0386"
          title="PJ Set Collection"
          subtitle="Premium comfort for restful nights"
        />

        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">Sleep in luxury</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our sleepwear collection prioritizes both comfort and quality. Each set is crafted from premium natural fabrics that breathe beautifully, regulate temperature, and feel incredible against your skin.
              </p>
            </div>

            <ProductGrid products={products} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default PJSetPage;