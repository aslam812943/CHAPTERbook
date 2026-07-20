'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedText from './AnimatedText';
import SectionEyebrow from './SectionEyebrow';

export default function CtaSection() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex flex-col items-center justify-center py-20 md:py-32 px-4 sm:px-6 md:px-8 overflow-hidden">
      <Image
        src="/cta-bg.png"
        alt="Ready to read background"
        fill
        className="object-cover object-center z-0"
        quality={90}
      />
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 max-w-2xl text-center flex flex-col items-center w-full px-2"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8 bg-ink/90 backdrop-blur-sm text-accent shadow-2xl flex items-center justify-center rounded-full ring-1 ring-accent/30">
          {/* Simple book icon placeholder */}
          <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>

        <SectionEyebrow className="mb-4 md:mb-5 justify-center drop-shadow-md">Start Today</SectionEyebrow>

        <h2 className="text-4xl sm:text-5xl md:text-7xl font-serif italic mb-4 md:mb-6 text-white drop-shadow-xl">
          <AnimatedText text="Ready to read?" />
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-paper/90 mb-8 md:mb-12 drop-shadow-md px-4">
          Discover your next favorite story in our extensive collection.
        </p>

        <Link href="/shop">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-ink text-white shadow-2xl ring-1 ring-white/20 px-8 py-3.5 md:px-12 md:py-5 rounded-full text-lg md:text-xl font-semibold tracking-wide hover:bg-accent hover:text-ink transition-colors duration-300"
          >
            Shop Now
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
}
