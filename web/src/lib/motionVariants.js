export const luxuryEase = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: i * 0.08, ease: luxuryEase },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: luxuryEase } },
};

export const slideFromLeft = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: luxuryEase } },
};

export const slideFromRight = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: luxuryEase } },
};

export const defaultViewport = { once: true, margin: '-80px' };
