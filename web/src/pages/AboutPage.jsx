import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us | Alliraa Textile</title>
        <meta name="description" content="Discover the heritage, craftsmanship, and values behind Alliraa Textile's luxury garments." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1628565548998-7121f5417ed5?q=80&w=2000" 
            alt="Textile making" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4 container">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 block"
          >
            The Atelier
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 max-w-4xl mx-auto"
          >
            A Return to Intentional Clothing
          </motion.h1>
        </div>
      </section>

      {/* Brand Heritage */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5"
            >
              <h2 className="mb-8">Our Heritage</h2>
              <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
                <p>
                  Founded on a philosophy of permanence, Alliraa Textile rejects the ephemeral nature of seasonal trends. Our journey began in a small studio, born from a desire to create garments that respect both the wearer and the artisans who construct them.
                </p>
                <p>
                  Today, we continue to design foundational pieces that anchor the modern wardrobe—celebrating the inherent beauty of raw, natural materials transformed through meticulous tailoring.
                </p>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lg:col-span-7 bg-accent aspect-[4/3] md:aspect-[16/10] overflow-hidden"
            >
              <img src="https://images.unsplash.com/photo-1699424031801-a51372e0975c?q=80&w=1200" alt="Design studio" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Craftsmanship & Quality */}
      <section className="py-24 bg-accent">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="mb-6">Uncompromising Craft</h2>
            <p className="text-lg text-muted-foreground font-light">
              We source only the finest natural fibers—organic cottons, pure silks, and European linens. Each piece is finished by hand in small batches, ensuring every seam is perfected before it reaches you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {['The Fibers', 'The Process', 'The Finish'].map((title, i) => (
              <motion.div 
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-background p-10 border border-border"
              >
                <span className="text-primary text-4xl font-serif mb-4 block">0{i+1}</span>
                <h3 className="text-xl mb-4">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {i === 0 && 'Sourcing globally for materials that provide breathability, durability, and a luxurious hand-feel that improves with age.'}
                  {i === 1 && 'Working alongside specialized artisans, we champion slow fashion methods to minimize waste and maximize structural integrity.'}
                  {i === 2 && 'Every garment undergoes rigorous inspection. Hand-finished hems and reinforced seams guarantee longevity.'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Values */}
      <section className="py-24 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-sm uppercase tracking-widest text-primary font-semibold block mb-4">Core Principles</span>
              <h2 className="mb-10 max-w-md">Driven by Purpose, Guided by Elegance</h2>
              <div className="aspect-[4/5] bg-secondary overflow-hidden">
                <img src="https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=1000" alt="Natural fabrics" className="w-full h-full object-cover" />
              </div>
            </motion.div>

            <div className="flex flex-col justify-center space-y-12 lg:pl-10 pt-10">
              {[
                { title: 'Sustainability', desc: 'Committing to earth-conscious practices at every stage of production.' },
                { title: 'Quality', desc: 'Rejecting planned obsolescence. Designing pieces meant to last a lifetime.' },
                { title: 'Elegance', desc: 'Finding sophistication in simplicity and honoring minimalist aesthetics.' },
                { title: 'Innovation', desc: 'Modernizing traditional techniques to create the heirlooms of tomorrow.' }
              ].map((value, idx) => (
                <motion.div 
                  key={value.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b border-border pb-8"
                >
                  <h3 className="text-2xl font-serif mb-3 text-foreground">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customization Services */}
      <section className="py-24 bg-foreground text-background text-center">
        <div className="container max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            Bespoke Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-background/70 font-light mb-10"
          >
            For discerning clients requiring custom tailoring or unique fabrications, our atelier offers personalized consultations.
          </motion.p>
          <motion.a 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            href="/contact" 
            className="luxury-button border border-primary text-primary hover:bg-primary hover:text-foreground"
          >
            Inquire About Bespoke
          </motion.a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;