"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Book } from "@/types/book";
import { Category } from "@/types/category";
import ShelfRow from "./ShelfRow";
import BookSpine from "./BookSpine";

type SortOption = "newest" | "price-asc" | "price-desc";

interface ShelfGroup {
  id: string;
  name: string;
  books: Book[];
}

export default function LibraryShelf({ books, categories }: { books: Book[]; categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const filterBarRef = useRef<HTMLDivElement>(null);

  const languages = useMemo(() => {
    const set = new Set(books.map((b) => b.language).filter(Boolean));
    return Array.from(set).sort();
  }, [books]);

  const filteredBooks = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = books.filter((book) => {
      const matchesSearch =
        !q || book.title.toLowerCase().includes(q) || book.authors.some((a) => a.toLowerCase().includes(q));
      const matchesLanguage = !language || book.language === language;
      return matchesSearch && matchesLanguage;
    });

    if (sort === "price-asc") {
      result = [...result].sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sort === "price-desc") {
      result = [...result].sort((a, b) => b.finalPrice - a.finalPrice);
    }

    return result;
  }, [books, search, language, sort]);

  const shelves = useMemo<ShelfGroup[]>(() => {
    const groups: ShelfGroup[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      books: filteredBooks.filter((book) => book.categoryIds.includes(category.id)),
    }));

    const categorized = new Set(categories.map((c) => c.id));
    const uncategorized = filteredBooks.filter((book) => !book.categoryIds.some((id) => categorized.has(id)));

    if (uncategorized.length > 0) {
      groups.push({ id: "__more__", name: "More Titles", books: uncategorized });
    }

    return groups.filter((g) => g.books.length > 0);
  }, [filteredBooks, categories]);

  const expandedShelf = shelves.find((s) => s.id === expandedCategoryId) ?? null;

  function scrollToFilters() {
    filterBarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero - "Discover Books You'll Love" copy is baked into the image itself */}
      <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px]">
        <Image
          src="/hero.png"
          alt="Discover Books You'll Love - explore thousands of handpicked books across every genre"
          fill
          priority
          className="object-cover object-left sm:object-center"
        />
        <div className="absolute sm:pl-10 inset-0 flex flex-col justify-end pb-8 sm:pb-12">
          <div className="max-w-6xl mx-auto w-full px-4 sm:px-8">
            <div className="mb-4 sm:pl-20 sm:mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-black mb-2 leading-tight">
                Discover <br className="hidden sm:block" />
                <span className="text-[#B8860B]">Books You'll Love</span>
              </h1>
              <p className="text-sm sm:text-base font-medium text-black max-w-sm">
                Explore thousands of handpicked books <br className="hidden sm:block" />
                across every genre.
              </p>
            </div>
            <div className="w-full max-w-md sm:max-w-lg sm:ml-20 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by title, author or ISBN..."
                  className="w-full bg-white/95 backdrop-blur-sm border border-white/60 rounded-full py-3 pl-10 pr-11 text-ink text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/60"
                />
                <svg
                  viewBox="0 0 24 24"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-current fill-none"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <button
                type="button"
                onClick={scrollToFilters}
                className="inline-flex items-center justify-center gap-2 bg-accent text-[#111] font-semibold px-6 py-3 rounded-full shadow-lg hover:brightness-110 transition-all whitespace-nowrap"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current fill-none" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-16">
        {/* Filter bar */}
        <div
          ref={filterBarRef}
          className="scroll-mt-24 bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3"
        >
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLanguage(null)}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                !language
                  ? "bg-wood-mid text-paper border-wood-mid shadow-[0_2px_8px_rgba(107,66,38,0.35)]"
                  : "bg-white border-gray-200 text-gray-600 hover:border-wood-mid hover:text-wood-mid"
              }`}
            >
              All Languages
            </button>
            {languages.map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  language === lang
                    ? "bg-wood-mid text-paper border-wood-mid shadow-[0_2px_8px_rgba(107,66,38,0.35)]"
                    : "bg-white border-gray-200 text-gray-600 hover:border-wood-mid hover:text-wood-mid"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 hidden sm:inline">Category:</span>
              <select
                value={expandedCategoryId || ""}
                onChange={(e) => setExpandedCategoryId(e.target.value || null)}
                className="bg-white border border-gray-300 rounded-md py-2 px-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-500 hidden sm:inline">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-white border border-gray-300 rounded-md py-2 px-3 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/60"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-8">
          {expandedCategoryId && !expandedShelf 
            ? "0 books found" 
            : `${filteredBooks.length} book${filteredBooks.length === 1 ? "" : "s"} found`}
        </p>

        {expandedCategoryId ? (
          <div>
            <button
              type="button"
              onClick={() => setExpandedCategoryId(null)}
              className="text-sm text-accent hover:underline mb-6 inline-flex items-center gap-1"
            >
              &larr; Back to all categories
            </button>
            <h2 className="font-serif italic text-2xl sm:text-3xl text-ink mb-6">
              {categories.find((c) => c.id === expandedCategoryId)?.name || "Category"}
            </h2>
            {expandedShelf && expandedShelf.books.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {expandedShelf.books.map((book) => (
                  <BookSpine key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-500">
                No books found in this category matching your filters.
              </div>
            )}
          </div>
        ) : shelves.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center text-gray-500">
            No books match your search. Try a different title, author, or language.
          </div>
        ) : (
          <div className="space-y-14">
            {shelves.map((shelf) => (
              <motion.section
                key={shelf.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif italic text-2xl sm:text-3xl text-ink">{shelf.name}</h2>
                  {shelf.id !== "__more__" && (
                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId(shelf.id)}
                      className="text-sm text-accent hover:underline inline-flex items-center gap-1 flex-shrink-0"
                    >
                      View All &rarr;
                    </button>
                  )}
                </div>

                <ShelfRow books={shelf.books} />
              </motion.section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
