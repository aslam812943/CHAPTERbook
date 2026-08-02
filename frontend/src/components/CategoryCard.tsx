"use client";

import Link from "next/link";
import Image from "next/image";
import { m } from "framer-motion";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";

const MotionLink = m.create(Link);

interface CategoryCardProps {
  name: string;
  count: number;
  coverImageUrl?: string;
  className?: string;
}

export default function CategoryCard({ name, count, coverImageUrl, className = "" }: CategoryCardProps) {
  return (
    <MotionLink
      href="/shop"
      className={`group block ${className}`}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 128px, (max-width: 768px) 33vw, 16vw"
            unoptimized={!isOptimizableImageUrl(coverImageUrl)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-serif italic text-gray-300">
            {name.slice(0, 1)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink text-center group-hover:text-accent transition-colors">
        {name}
      </p>
      <p className="text-xs text-gray-500 text-center">
        {count} book{count === 1 ? "" : "s"}
      </p>
    </MotionLink>
  );
}
