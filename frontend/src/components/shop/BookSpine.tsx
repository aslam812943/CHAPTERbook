"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Book } from "@/types/book";
import PriceDisplay from "@/components/PriceDisplay";
import StarIcon from "@/components/books/StarIcon";

const MotionLink = motion.create(Link);

// A handful of warm, library-appropriate fallback tones for books with no
// cover image, so an empty cover still reads as "a book" rather than a
// blank box. Picked deterministically per book (see hashString) so a given
// book always gets the same tone instead of flickering on re-render.
const FALLBACK_TONES = [
  "bg-[#7a2e2e]", // oxblood
  "bg-[#2e4d3f]", // forest
  "bg-[#2e3a4d]", // navy
  "bg-[#4d3a2e]", // walnut
  "bg-[#5c3d5c]", // plum
  "bg-[#3d5c56]", // teal
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface BookSpineProps {
  book: Book;
}

export default function BookSpine({ book }: BookSpineProps) {
  const hash = hashString(book.id);
  const tone = FALLBACK_TONES[hash % FALLBACK_TONES.length];

  return (
    <MotionLink
      href={`/books/${book.id}`}
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, y: 24, transition: { duration: 0.2 } }}
      whileHover={{ y: -10, transition: { duration: 0.25, ease: "easeOut" } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group flex-shrink-0 w-[170px] sm:w-[190px] md:w-[210px] cursor-pointer snap-start block"
    >
      {/* The cover */}
      <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden ring-1 ring-black/10 shadow-[2px_4px_8px_rgba(0,0,0,0.35)] group-hover:shadow-[4px_10px_20px_rgba(0,0,0,0.45)] transition-shadow duration-300">
        {book.coverImageUrl ? (
          <Image
            src={book.coverImageUrl}
            alt={book.title}
            fill
            className="object-cover"
            unoptimized
            sizes="210px"
          />
        ) : (
          <div className={`w-full h-full ${tone} spine-fallback flex flex-col items-center justify-center p-3`}>
            <span className="font-serif italic text-paper text-sm text-center leading-snug line-clamp-5">
              {book.title}
            </span>
          </div>
        )}

        {book.discountPercentage > 0 && (
          <span className="absolute top-1.5 left-1.5 text-[10px] font-semibold uppercase tracking-wide bg-sale text-paper px-1.5 py-0.5 rounded-sm shadow">
            -{book.discountPercentage}%
          </span>
        )}
      </div>

      {/* Title / author / price - always visible, not just on hover */}
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug min-h-[2.5rem]">{book.title}</p>
        <p className="text-xs text-gray-500 line-clamp-1 mt-1">{book.authors.join(", ") || "Unknown author"}</p>
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <PriceDisplay
            price={book.price}
            discountPercentage={book.discountPercentage}
            finalPrice={book.finalPrice}
            className="text-sm"
          />
          {book.avgRating !== undefined && (
            <span className="flex items-center gap-1 text-xs font-medium text-gray-600 flex-shrink-0">
              <StarIcon filled className="w-3.5 h-3.5" />
              {book.avgRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </MotionLink>
  );
}
