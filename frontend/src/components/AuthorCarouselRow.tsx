"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useDragScroll } from "@/components/shop/useDragScroll";
import { Author } from "@/types/author";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";

export default function AuthorCarouselRow({ authors }: { authors: Author[] }) {
  const { ref, onPointerDown, onClickCapture } = useDragScroll<HTMLDivElement>();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges, authors.length]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Show authors to the left"
          onClick={() => scrollByAmount(-1)}
          className="hidden sm:flex absolute -left-4 top-[3.25rem] -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-ink hover:text-accent transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      )}

      <div
        ref={ref}
        onPointerDown={onPointerDown}
        onClickCapture={onClickCapture}
        className="no-scrollbar flex gap-6 sm:gap-8 overflow-x-auto scroll-smooth snap-x snap-proximity px-1 pb-2 cursor-grab active:cursor-grabbing select-none"
      >
        {authors.map((author) => (
          <Link
            key={author.id}
            href={`/shop?author=${encodeURIComponent(author.name)}`}
            className="group flex-shrink-0 w-24 sm:w-28 flex flex-col items-center text-center snap-start"
          >
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md group-hover:shadow-lg transition-shadow">
              {author.imageUrl ? (
                <Image
                  src={author.imageUrl}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 96px, 112px"
                  unoptimized={!isOptimizableImageUrl(author.imageUrl)}
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-serif italic text-gray-300">
                  {author.name.slice(0, 1)}
                </div>
              )}
            </div>
            <p className="mt-3 text-xs sm:text-sm font-semibold uppercase tracking-wide text-ink group-hover:text-accent transition-colors">
              {author.name}
            </p>
          </Link>
        ))}
      </div>

      {canScrollRight && (
        <button
          type="button"
          aria-label="Show authors to the right"
          onClick={() => scrollByAmount(1)}
          className="hidden sm:flex absolute -right-4 top-[3.25rem] -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-ink hover:text-accent transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
