'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import AnimatedText from './AnimatedText';
import SectionEyebrow from './SectionEyebrow';

// const FEATURES = [
//   {
//     title: 'Wide Collection',
//     subtitle: 'Books for every reader',
//     path: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
//   },
//   {
//     title: 'Best Quality',
//     subtitle: 'Carefully selected',
//     path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
//   },
//   {
//     title: 'Fast Delivery',
//     subtitle: 'To your doorstep',
//     path: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m9-3.348-9 0',
//   },
//   {
//     title: 'Loved by Readers',
//     subtitle: 'Join thousands',
//     path: 'M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z',
//   },
// ];

export default function CtaSection() {
  return (
    <section className="relative flex flex-col items-center justify-center py-25 md:py-12 px-4 sm:px-6 md:px-8 overflow-hidden">
      <Image
        src="/cta-bg.png"
        alt="Every Book Opens a New World background"
        fill
        className="object-cover object-center z-0"
        quality={100}
      />
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 max-w-3xl text-center flex flex-col items-center w-full px-2"
      >
        <div className="w-16 h-10 md:w-20 md:h-20 mb-4 md:mb-6 bg-ink/90 backdrop-blur-sm text-accent shadow-2xl flex items-center justify-center rounded-full ring-1 ring-accent/30">
          <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
          </svg>
        </div>

        <SectionEyebrow className="mb-3 md:mb-4 justify-center drop-shadow-md">Start Your Journey</SectionEyebrow>

        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-3 md:mb-4 drop-shadow-xl leading-tight">
          <span className="block text-white">
            <AnimatedText text="Every Book" />
          </span>
          <span className="block text-accent">
            <AnimatedText text="Opens a New World" />
          </span>
        </h2>

        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span className="h-px w-10 sm:w-16 bg-accent/70" />
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <span className="h-px w-10 sm:w-16 bg-accent/70" />
        </div>

        <p className="text-base sm:text-lg md:text-xl text-paper/90 mb-6 md:mb-8 drop-shadow-md px-4 max-w-xl">
          From timeless classics to modern bestsellers, find books that inspire, entertain, and transform.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-4 md:mb-6">
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-ink text-white shadow-2xl ring-1 ring-white/20 px-6 py-3 md:px-8 md:py-4 rounded-full text-lg font-semibold tracking-wide hover:bg-accent hover:text-ink transition-colors duration-300"
            >
              Explore Books &rarr;
            </motion.button>
          </Link>

          <Link
            href="/#new-arrivals"
            className="text-accent font-semibold underline underline-offset-4 hover:text-white transition-colors drop-shadow-md"
          >
            View New Arrivals &rarr;
          </Link>
        </div>

        {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl px-4 sm:px-8 py-4 sm:py-5 max-w-2xl w-full">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3 text-left">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-accent flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
              </svg>
              <div>
                <p className="text-white text-sm font-semibold">{feature.title}</p>
                <p className="text-white/60 text-xs">{feature.subtitle}</p>
              </div>
            </div>
          ))}
        </div> */}
      </motion.div>
    </section>
  );
}
