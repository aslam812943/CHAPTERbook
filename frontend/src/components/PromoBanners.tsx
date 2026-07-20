"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const BANNERS = [
  {
    src: "/promo-new-arrivals.png",
    alt: "New Arrivals - Fresh Books, Endless Ideas. Explore newly added books across all genres.",
    fromX: -80,
  },
  {
    src: "/promo-summer-picks.png",
    alt: "Summer Reading Picks - Curated Books, Timeless Stories. Handpicked books to inspire, entertain, and enlighten.",
    fromX: 80,
  },
];

export default function PromoBanners() {
  return (
    <section className="pt-4 pb-16 px-4 sm:px-6 md:px-8 bg-paper">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 items-stretch gap-4 sm:gap-6 md:gap-8">
        {BANNERS.map((banner) => (
          <motion.div
            key={banner.src}
            initial={{ opacity: 0, x: banner.fromX }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <Link
              href="/shop"
              className="group block relative w-full h-full aspect-[16/9] sm:aspect-[4/3] md:aspect-[16/9] lg:aspect-[2/1] rounded-lg sm:rounded-2xl overflow-hidden shadow-lg"
            >
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 512px"
              />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
