import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Elena Rostova',
    text: 'The craftsmanship of the floral maxi dress is unparalleled. It drapes beautifully and the fabric breathes like nothing else I own. Truly a foundational piece for my wardrobe.',
    rating: 5,
    location: 'Milan, Italy'
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    text: 'I purchased the structural tote bag for work and it has exceeded all expectations. Elegant, durable, and thoughtfully designed down to the last stitch.',
    rating: 5,
    location: 'New York, USA'
  },
  {
    id: 3,
    name: 'Amara Diop',
    text: 'Wearing the artisanal kimono feels like wearing art. The attention to detail and ethical sourcing make it a purchase I feel genuinely good about.',
    rating: 5,
    location: 'London, UK'
  },
  {
    id: 4,
    name: 'Mei Lin',
    text: 'The linen lounge set has become my daily uniform. It manages to look put-together while being incredibly comfortable. Will be ordering in another color.',
    rating: 5,
    location: 'Singapore'
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 bg-accent">
      <div className="container">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-border mb-8"
          >
            <div className="flex text-primary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase">500+ Verified Reviews</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Words from Our Clientele
          </motion.h2>
        </div>

        <div className="max-w-4xl mx-auto relative h-[300px] md:h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
            >
              <p className="text-xl md:text-3xl font-serif leading-relaxed text-foreground mb-8">
                "{testimonials[currentIndex].text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-serif text-xl">
                  {testimonials[currentIndex].name.charAt(0)}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {testimonials[currentIndex].name}
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </p>
                  <p className="text-sm text-muted-foreground">{testimonials[currentIndex].location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-foreground' : 'w-4 bg-border hover:bg-muted-foreground'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;