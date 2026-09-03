import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, defaultViewport } from '@/lib/motionVariants.js';

const Reveal = ({
  children,
  className,
  delay = 0,
  variant = fadeUp,
  as: Component = motion.div,
  ...props
}) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={className}
      variants={variant}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      custom={delay}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Reveal;
