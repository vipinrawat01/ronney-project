import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { Skeleton } from '@/components/ui/skeleton';
import Reveal from '@/components/Reveal.jsx';
import { luxuryEase } from '@/lib/motionVariants.js';

const PLACEHOLDER_ITEMS = [
  {
    id: 'trend-1',
    name: 'Canvas Tote Bag',
    price: 45,
    image: 'https://images.hostinger.com/bf8f6132-2617-4659-8733-71335300c422.png',
    link: '/category/women/tote-bags',
    area: 'i1',
  },
  {
    id: 'trend-2',
    name: 'Floral Pouch',
    price: 28,
    image: 'https://images.hostinger.com/d04a43d9-643b-4fd8-9b37-abad8073e87c.png',
    link: '/category/women/pouch-bags',
    area: 'i2',
  },
  {
    id: 'trend-3',
    name: 'Linen Collection',
    price: 62,
    image: 'https://images.hostinger.com/f6d393c2-1e22-4a11-9e42-f239d3f81838.png',
    link: '/shop',
    area: 'i3',
  },
  {
    id: 'trend-4',
    name: 'Leather Accents',
    price: 78,
    image: 'https://images.hostinger.com/ffeeb997-7801-4b5c-a995-77b4f488bdf3.png',
    link: '/shop',
    area: 'i4',
  },
  {
    id: 'trend-5',
    name: 'Printed Fabrics',
    price: 35,
    image: 'https://images.hostinger.com/c63fdf1c-44d0-4d35-9629-5965d6b94e07.png',
    link: '/shop',
    area: 'i5',
  },
  {
    id: 'trend-6',
    name: 'Travel Duffle',
    price: 89,
    image: 'https://images.hostinger.com/2a3c4564-00d6-4f75-9c69-a0bf5ace5596.png',
    link: '/shop',
    area: 'i6',
  },
];

const GRID_AREA = {
  i1: 'md:col-start-1 md:row-start-1 md:row-span-2 min-h-[280px] md:min-h-0',
  i2: 'md:col-start-2 md:row-start-1 min-h-[180px] md:min-h-0',
  i4: 'md:col-start-3 md:row-start-1 min-h-[180px] md:min-h-0',
  i3: 'md:col-start-2 md:col-span-2 md:row-start-2 min-h-[200px] md:min-h-0',
  i5: 'md:col-start-1 md:col-span-2 md:row-start-3 min-h-[160px] md:min-h-0',
  i6: 'md:col-start-3 md:row-start-3 min-h-[160px] md:min-h-0',
};

const BentoCard = ({ item, index, shouldReduceMotion }) => (
  <Reveal delay={index} className={GRID_AREA[item.area]}>
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { scale: 1.01 }}
      transition={{ duration: 0.5, ease: luxuryEase }}
      className="group relative h-full w-full overflow-hidden rounded-2xl md:rounded-3xl bg-muted"
    >
      <Link to={item.link} className="block h-full w-full">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
          <p className="text-white font-serif text-base md:text-lg leading-tight">{item.name}</p>
          <p className="text-white/80 text-sm mt-1">${item.price?.toFixed(2)}</p>
        </div>
      </Link>
    </motion.div>
  </Reveal>
);

const TrendingProductsBento = () => {
  const [items, setItems] = useState(PLACEHOLDER_ITEMS);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const res = await pb.collection('products').getList(1, 6, { sort: '-created', $autoCancel: false });
        if (res.items.length >= 6) {
          setItems(
            res.items.map((p, i) => ({
              id: p.id,
              name: p.name,
              price: p.price,
              image: p.images?.[0]
                ? pb.files.getURL(p, p.images[0], { thumb: '800x800' })
                : PLACEHOLDER_ITEMS[i].image,
              link: `/product/${p.id}`,
              area: PLACEHOLDER_ITEMS[i].area,
            }))
          );
        }
      } catch {
        /* keep placeholders */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <Reveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Trending Products</h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors shrink-0"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-3 md:gap-4 min-h-[640px]">
            <Skeleton className="md:col-start-1 md:row-start-1 md:row-span-2 rounded-3xl min-h-[280px]" />
            <Skeleton className="md:col-start-2 md:row-start-1 rounded-3xl min-h-[180px]" />
            <Skeleton className="md:col-start-3 md:row-start-1 rounded-3xl min-h-[180px]" />
            <Skeleton className="md:col-start-2 md:col-span-2 md:row-start-2 rounded-3xl min-h-[200px]" />
            <Skeleton className="md:col-start-1 md:col-span-2 md:row-start-3 rounded-3xl min-h-[160px]" />
            <Skeleton className="md:col-start-3 md:row-start-3 rounded-3xl min-h-[160px]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-3 md:gap-4 md:min-h-[640px]">
            {items.map((item, i) => (
              <BentoCard key={item.id} item={item} index={i} shouldReduceMotion={shouldReduceMotion} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingProductsBento;
