import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { luxuryEase } from '@/lib/motionVariants.js';
import { useBranding } from '@/contexts/BrandingContext.jsx';

const BrandStory = () => {
  const shouldReduceMotion = useReducedMotion();
  const { branding } = useBranding();
  const story = branding.brand_story || {};

  if (branding.show_brand_story === false) return null;

  return (
    <section className="py-24 md:py-32 bg-muted/30 overflow-hidden">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: luxuryEase }}
            className="lg:col-span-5 order-2 lg:order-1"
          >
            <h2 className="mb-8">{story.title}</h2>
            <div className="space-y-6 text-lg text-muted-foreground font-light leading-relaxed">
              {story.paragraph_1 && <p>{story.paragraph_1}</p>}
              {story.paragraph_2 && <p>{story.paragraph_2}</p>}
            </div>
            <div className="mt-12 pt-12 border-t border-border">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-serif text-2xl mb-2">Origins</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Founded 2020</p>
                </div>
                <div>
                  <h4 className="font-serif text-2xl mb-2">Practice</h4>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider">Slow Fashion</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.98 }}
            whileInView={shouldReduceMotion ? undefined : { opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1, ease: luxuryEase }}
            className="lg:col-span-7 order-1 lg:order-2"
          >
            <div className="relative aspect-[4/5] md:aspect-[16/10] lg:aspect-[4/5] overflow-hidden bg-secondary rounded-2xl">
              <img
                src={story.image_url}
                alt="Textile detail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
