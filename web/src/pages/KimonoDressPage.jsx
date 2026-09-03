import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProductGrid from '@/components/ProductGrid.jsx';

function KimonoDressPage() {
  const products = [
    {
      title: 'Silk Kimono Elegance',
      description: 'Pure silk kimono dress with traditional Japanese-inspired patterns. Hand-finished seams and premium silk ensure a luxurious drape and feel.',
      image: 'https://images.unsplash.com/photo-1655845622980-ec5167330569',
      price: 189
    },
    {
      title: 'Traditional Fusion Kimono',
      description: 'Contemporary kimono robe blending Eastern craftsmanship with Western silhouettes. Features hand-dyed fabrics and intricate embroidered details.',
      image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc',
      price: 167
    },
    {
      title: 'Modern Kimono Robe',
      description: 'Lightweight linen kimono with minimalist design. Perfect for layering, this versatile piece transitions seamlessly from day to evening.',
      image: 'https://images.unsplash.com/photo-1622519407650-3df9883f76e5',
      price: 134
    }
  ];

  return (
    <>
      <Helmet>
        <title>Kimono Dress Collection - Alliraa Textile</title>
        <meta name="description" content="Discover our kimono collection where traditional craftsmanship meets contemporary design in handcrafted silk and linen pieces." />
      </Helmet>

      <Header />

      <main>
        <HeroSection
          image="https://images.unsplash.com/photo-1655845622980-ec5167330569"
          title="Kimono Dress Collection"
          subtitle="Traditional craftsmanship reimagined"
        />

        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">East meets West in perfect harmony</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our kimono collection honors centuries-old textile traditions while embracing modern design sensibilities. Each piece is crafted with meticulous attention to detail, using premium silk and linen that drape beautifully and age gracefully.
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

export default KimonoDressPage;