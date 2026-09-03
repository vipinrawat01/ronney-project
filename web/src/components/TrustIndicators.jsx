import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Leaf, ShieldCheck, Scissors } from 'lucide-react';

const indicators = [
  {
    icon: Scissors,
    title: 'Artisanal Craft',
    description: 'Finished by hand in small batches.'
  },
  {
    icon: Leaf,
    title: 'Natural Fibers',
    description: 'Sourced for minimal environmental impact.'
  },
  {
    icon: ShieldCheck,
    title: 'Enduring Quality',
    description: 'Constructed to outlast seasonal trends.'
  },
  {
    icon: Sparkles,
    title: 'Timeless Form',
    description: 'Silhouettes that remain relevant.'
  }
];

const TrustIndicators = () => {
  return (
    <section className="py-20 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {indicators.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="mx-auto w-12 h-12 flex items-center justify-center bg-secondary rounded-full mb-6">
                <item.icon className="w-5 h-5 text-foreground" strokeWidth={1.5} />
              </div>
              <h4 className="font-serif text-xl mb-3">{item.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustIndicators;