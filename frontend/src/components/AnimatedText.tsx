'use client';
import { m, Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.045 },
  },
};

const word: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
}

// Staggers a headline into view word-by-word. Purely a text-reveal layer -
// doesn't touch scroll position or pinning, so it's safe to drop into
// sections driven by a GSAP ScrollTrigger pin/scrub timeline without
// interfering with it.
export default function AnimatedText({ text, className, once = true }: AnimatedTextProps) {
  return (
    <m.span
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: '-15% 0px' }}
    >
      {text.split(' ').map((w, i) => (
        <m.span key={i} variants={word} className="inline-block will-change-transform">
          {w}
          {' '}
        </m.span>
      ))}
    </m.span>
  );
}
