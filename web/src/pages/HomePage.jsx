import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import Reveal from '@/components/Reveal.jsx';
import BrandStory from '@/components/BrandStory.jsx';
import LookbookGallery from '@/components/LookbookGallery.jsx';
import TrendingProductsBento from '@/components/TrendingProductsBento.jsx';
import TestimonialsSection from '@/components/TestimonialsSection.jsx';
import FeaturedProductCarousel from '@/components/FeaturedProductCarousel.jsx';
import NewsletterSignup from '@/components/NewsletterSignup.jsx';
import ShopByCategoryCarousel from '@/components/ShopByCategoryCarousel.jsx';
import { luxuryEase, slideFromLeft, slideFromRight } from '@/lib/motionVariants.js';
import { useBranding } from '@/contexts/BrandingContext.jsx';

const services = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30 days return policy' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure checkout' },
];

const heroStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: luxuryEase } },
};

const ScrollCue = () => {
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) setVisible(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || shouldReduceMotion) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
    >
      <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Scroll</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-px h-8 bg-muted-foreground/40"
      />
    </motion.div>
  );
};

const PromoBanner = ({ banner, index }) => {
  const ref = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? ['0%', '0%'] : ['-4%', '4%']);
  const variant = index === 0 ? slideFromLeft : slideFromRight;

  return (
    <motion.div
      ref={ref}
      variants={shouldReduceMotion ? undefined : variant}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-80px' }}
      className="relative overflow-hidden rounded-3xl bg-muted min-h-[240px] flex items-center"
    >
      <motion.div className="absolute inset-0 scale-110" style={{ y: imageY }}>
        <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" loading="lazy" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
      <div className="relative z-10 p-8 md:p-10 max-w-[60%]">
        <span className="inline-block bg-background/80 backdrop-blur px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase mb-4">{banner.badge}</span>
        <h3 className="text-2xl md:text-3xl font-serif leading-tight mb-2">{banner.title}</h3>
        {banner.sub && <p className="text-sm text-muted-foreground mb-5">{banner.sub}</p>}
        <Link
          to={banner.link || '/shop'}
          className="inline-block mt-3 px-6 py-3 rounded-full text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
        >
          {banner.cta}
        </Link>
      </div>
    </motion.div>
  );
};

const HomePage = () => {
  const shouldReduceMotion = useReducedMotion();
  const { branding } = useBranding();
  const hero = branding.hero || {};
  const promoBanners = branding.promo_banners || [];

  return (
    <div className="min-h-screen bg-background flex flex-col pt-[120px]">
      <Helmet>
        <title>{branding.store_name || 'Alliraa Textile'} | Luxury Handmade Textile Collection</title>
      </Helmet>

      {/* HERO */}
      <section className="container pb-0">
        <div className="relative overflow-hidden rounded-[2rem] bg-muted min-h-[85vh] flex items-center">
          <motion.img
            src={hero.image_url}
            alt={hero.title || 'Luxury handmade textile collection'}
            className="absolute inset-0 w-full h-full object-cover"
            initial={shouldReduceMotion ? false : { scale: 1 }}
            animate={shouldReduceMotion ? undefined : { scale: 1.05 }}
            transition={{ duration: 20, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="relative z-10 max-w-xl px-6 md:px-10 py-16"
          >
            {hero.badge && (
              <motion.span variants={heroItem} className="inline-block bg-background/80 backdrop-blur px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6">
                {hero.badge}
              </motion.span>
            )}
            <motion.h1 variants={heroItem} className="text-4xl md:text-6xl font-serif leading-tight mb-5">
              {hero.title}
            </motion.h1>
            {hero.subtitle && (
              <motion.p variants={heroItem} className="text-base md:text-lg text-muted-foreground mb-8 max-w-md">
                {hero.subtitle}
              </motion.p>
            )}
            <motion.div variants={heroItem} className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => document.getElementById('shop-by-category')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                View Collection
              </button>
            </motion.div>
          </motion.div>
          <ScrollCue />
        </div>

        {/* Floating service cards */}
        <Reveal delay={3} className="relative z-20 -mt-10 mx-2 md:mx-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-background rounded-2xl shadow-xl shadow-black/5 border border-border p-6">
          {services.map((s) => (
            <div key={s.title} className="flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-full bg-muted group-hover:bg-primary/20 flex items-center justify-center shrink-0 transition-colors duration-500">
                <s.icon className="w-5 h-5 text-primary" strokeWidth={1.75} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Dynamic Shop by Category — just below banner */}
      <ShopByCategoryCarousel />

      {/* MANIFESTO */}
      {branding.show_manifesto !== false && branding.manifesto && (
        <section className="py-12 md:py-16 border-b border-primary/20">
          <Reveal className="container text-center">
            <p className="text-lg md:text-xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed italic font-serif">
              {branding.manifesto}
            </p>
          </Reveal>
        </section>
      )}

      <BrandStory />
      {false && <LookbookGallery />}

      {/* PROMO BANNERS */}
      {branding.show_promo_banners !== false && promoBanners.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="container grid grid-cols-1 md:grid-cols-2 gap-6">
            {promoBanners.map((b, i) => (
              <PromoBanner key={`${b.badge}-${i}`} banner={b} index={i} />
            ))}
          </div>
        </section>
      )}

      <TrendingProductsBento />
      {false && <TestimonialsSection />}
      {false && <FeaturedProductCarousel />}
      <NewsletterSignup />
    </div>
  );
};

export default HomePage;
