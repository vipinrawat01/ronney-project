import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProductGrid from '@/components/ProductGrid.jsx';

function BagsPage() {
  const toteBags = [
    {
      title: 'Canvas Tote Classic',
      description: 'Durable organic cotton canvas tote with reinforced handles. Spacious interior and minimalist design make this your everyday essential.',
      image: 'https://images.unsplash.com/photo-1492360511723-8ac1d712eaf0',
      price: 67
    },
    {
      title: 'Linen Everyday Tote',
      description: 'Premium European linen tote with leather accents. Features interior pockets and a structured base that stands upright.',
      image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7',
      price: 89
    },
    {
      title: 'Luxury Leather Tote',
      description: 'Full-grain leather tote with hand-stitched details. Ages beautifully over time, developing a rich patina unique to your use.',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
      price: 178
    }
  ];

  const pouchBags = [
    {
      title: 'Silk Pouch Deluxe',
      description: 'Hand-embroidered silk pouch with zipper closure. Perfect for storing jewelry, cosmetics, or small essentials with elegant style.',
      image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d',
      price: 45
    },
    {
      title: 'Embroidered Pouch',
      description: 'Cotton canvas pouch featuring intricate hand embroidery. Each piece is unique, showcasing traditional needlework techniques.',
      image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
      price: 38
    },
    {
      title: 'Travel Pouch Set',
      description: 'Set of three nesting pouches in premium linen. Ideal for organizing travel essentials or daily items with sustainable style.',
      image: 'https://images.unsplash.com/photo-1564422170194-896b89110ef8',
      price: 72
    }
  ];

  return (
    <>
      <Helmet>
        <title>Luxury Bags Collection - Alliraa Textile</title>
        <meta name="description" content="Explore our collection of handcrafted tote bags and pouches combining durability with timeless style." />
      </Helmet>

      <Header />

      <main>
        <HeroSection
          image="https://images.unsplash.com/photo-1492360511723-8ac1d712eaf0"
          title="Luxury Bags Collection"
          subtitle="Handcrafted accessories for everyday elegance"
        />

        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">Tote Bags</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our tote bags combine functionality with refined aesthetics. Crafted from premium materials and built to last, each tote is designed to be your reliable companion for years to come.
              </p>
            </div>

            <ProductGrid products={toteBags} />
          </div>
        </section>

        <section className="py-24 bg-muted">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">Pouch Bags</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Small in size but rich in detail, our pouches showcase the finest in textile craftsmanship. Perfect for organizing essentials or as thoughtful gifts.
              </p>
            </div>

            <ProductGrid products={pouchBags} />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default BagsPage;