import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import HeroSection from '@/components/HeroSection.jsx';
import ProductGrid from '@/components/ProductGrid.jsx';

function BohoMaxiPage() {
  const products = [
    {
      title: 'Sunset Boho Maxi',
      description: 'Flowing cotton maxi dress in warm sunset hues. Features hand-embroidered details and a relaxed silhouette that moves beautifully with every step.',
      image: 'https://images.unsplash.com/photo-1678534958111-ae19f0a9ecd3',
      price: 118
    },
    {
      title: 'Flowing Bohemian Dress',
      description: 'Lightweight rayon maxi with intricate ethnic prints. The tiered design and gathered waist create a flattering, effortless look.',
      image: 'https://images.unsplash.com/photo-1596783074918-c84cb06531ca',
      price: 103
    },
    {
      title: 'Ethnic Maxi Elegance',
      description: 'Premium linen maxi dress featuring artisanal block prints. Each print is hand-applied using traditional techniques passed down through generations.',
      image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
      price: 145
    }
  ];

  return (
    <>
      <Helmet>
        <title>Boho Maxi Collection - Alliraa Textile</title>
        <meta name="description" content="Browse our boho maxi collection featuring flowing fabrics and artisanal details for effortless elegance." />
      </Helmet>

      <Header />

      <main>
        <HeroSection
          image="https://images.unsplash.com/photo-1678534958111-ae19f0a9ecd3"
          title="Boho Maxi Collection"
          subtitle="Free-spirited elegance in flowing fabrics"
        />

        <section className="py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="mb-6">Artisanal design for the modern wanderer</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our boho maxi collection celebrates the beauty of handcrafted textiles and relaxed silhouettes. Each dress is designed to flow naturally with your movements, featuring artisanal prints and embroidery that tell a story of traditional craftsmanship.
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

export default BohoMaxiPage;