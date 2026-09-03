import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProductGrid from '@/components/ProductGrid.jsx';

function FloralDressPage() {
  const products = [
    {
      title: 'Summer Floral Bloom',
      description: 'Lightweight cotton dress featuring hand-painted botanical prints. Perfect for warm days, this piece combines breathability with artistic flair.',
      image: 'https://images.unsplash.com/photo-1678534958210-b79254d3eb6a',
      price: 127
    },
    {
      title: 'Garden Party Dress',
      description: 'Silk-blend midi dress with delicate floral embroidery. Each flower is carefully stitched by our artisans, creating a truly unique garment.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
      price: 156
    },
    {
      title: 'Botanical Print Dress',
      description: 'Flowing maxi dress in premium linen with oversized botanical prints. Natural dyes ensure rich, lasting color while remaining gentle on the environment.',
      image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
      price: 142
    }
  ];

  return (
    <>
      <Helmet>
        <title>Floral Dress Collection - Alliraa Textile</title>
        <meta name="description" content="Explore our floral dress collection featuring hand-painted botanical prints on premium cotton and silk blends." />
      </Helmet>

      <Header />

      <main>
        <HeroSection
          image="https://images.unsplash.com/photo-1678534958210-b79254d3eb6a"
          title="Floral Dress Collection"
          subtitle="Botanical beauty woven into every thread"
        />

        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">Nature-inspired elegance</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our floral collection celebrates the timeless beauty of botanical prints. Each dress is crafted from premium natural fabrics and features carefully selected floral motifs that bring a touch of garden elegance to your wardrobe.
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

export default FloralDressPage;