"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Book } from "@/types/book";
import BookSpine from "./BookSpine";
import { useDragScroll } from "./useDragScroll";

interface ShelfRowProps {
  books: Book[];
}

export default function ShelfRow({ books }: ShelfRowProps) {
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
  }, [ref, updateEdges, books.length]);

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
          aria-label="Show books to the left"
          onClick={() => scrollByAmount(-1)}
          className="hidden sm:flex absolute left-0 top-0 bottom-4 z-20 w-10 items-center justify-center bg-gradient-to-r from-wood-dark/50 to-transparent text-paper hover:from-wood-dark/70 transition-colors"
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
        className="no-scrollbar flex items-end gap-5 sm:gap-7 overflow-x-auto pb-4 px-1 scroll-smooth snap-x snap-proximity cursor-grab active:cursor-grabbing select-none touch-pan-x"
      >
        <AnimatePresence initial={false}>
          {books.map((book) => (
            <BookSpine key={book.id} book={book} />
          ))}
        </AnimatePresence>
      </div>

      {canScrollRight && (
        <button
          type="button"
          aria-label="Show books to the right"
          onClick={() => scrollByAmount(1)}
          className="hidden sm:flex absolute right-0 top-0 bottom-4 z-20 w-10 items-center justify-center bg-gradient-to-l from-wood-dark/50 to-transparent text-paper hover:from-wood-dark/70 transition-colors"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
