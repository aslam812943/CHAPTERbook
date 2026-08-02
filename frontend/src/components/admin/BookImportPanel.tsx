"use client";

import { useActionState, useState, useTransition, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { searchBooksAction, createBookAction, CreateBookFormState } from "@/app/admin/books/import/actions";
import { createCategoryAction } from "@/app/admin/categories/actions";
import { BookLookupResult } from "@/types/book";
import { Category } from "@/types/category";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { parsePastedBookDetails } from "@/lib/parsePastedBookDetails";
import { isOptimizableImageUrl } from "@/lib/isOptimizableImageUrl";
import PricingFields from "./PricingFields";

// A checkbox <input name="categoryIds"> group comes back from
// form.elements.namedItem as a single element when there's only one, or a
// RadioNodeList when there are several - normalize both to an array.
function getCategoryCheckboxes(form: HTMLFormElement): HTMLInputElement[] {
  const field = form.elements.namedItem("categoryIds");
  if (!field) return [];
  return field instanceof RadioNodeList ? (Array.from(field) as HTMLInputElement[]) : [field as HTMLInputElement];
}

const initialState: CreateBookFormState = { success: false, message: "" };

// Used when a book isn't found on Google Books / Open Library (e.g. a
// regional-language title only listed on a store like DC Books) - reuses
// the exact same review-and-save form, just starting from blank fields
// instead of a prefilled API result.
const BLANK_MANUAL: BookLookupResult = {
  source: "manual",
  sourceId: "",
  title: "",
  authors: [],
  description: "",
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-accent text-[#111] font-semibold py-3 px-4 rounded-md hover:brightness-110 transition-all disabled:opacity-70"
    >
      {pending ? "Saving to catalog..." : "Save to Catalog"}
    </button>
  );
}

export default function BookImportPanel({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookLookupResult[]>([]);
  const [selected, setSelected] = useState<BookLookupResult | null>(null);
  const [searchError, setSearchError] = useState("");
  const [isSearching, startSearch] = useTransition();
  const [state, formAction] = useActionState(createBookAction, initialState);
  const [pasteText, setPasteText] = useState("");
  const [categoryMatchNote, setCategoryMatchNote] = useState("");
  const [unmatchedCategory, setUnmatchedCategory] = useState<string | null>(null);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);
  const [isCreatingCategory, startCreateCategory] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function findMatchingCategory(name: string): Category | undefined {
    const needle = name.trim().toLowerCase();
    if (!needle) return undefined;

    return (
      categories.find((c) => c.name.toLowerCase() === needle) ??
      categories.find((c) => c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase()))
    );
  }

  function fillFieldsFromPaste() {
    const parsed = parsePastedBookDetails(pasteText);
    const form = formRef.current;
    if (!form) return;

    if (parsed.title) (form.elements.namedItem("title") as HTMLInputElement).value = parsed.title;
    if (parsed.authors) (form.elements.namedItem("authors") as HTMLInputElement).value = parsed.authors;
    if (parsed.language) (form.elements.namedItem("language") as HTMLInputElement).value = parsed.language;
    if (parsed.description) {
      (form.elements.namedItem("description") as HTMLTextAreaElement).value = parsed.description;
    }

    setCategoryMatchNote("");
    setUnmatchedCategory(null);
    if (parsed.category) {
      const match = findMatchingCategory(parsed.category);
      if (match) {
        for (const checkbox of getCategoryCheckboxes(form)) {
          if (checkbox.value === match.id) checkbox.checked = true;
        }
        setCategoryMatchNote(`Matched category: ${match.name}`);
      } else {
        setUnmatchedCategory(parsed.category);
        setCategoryMatchNote(`No matching category for "${parsed.category}".`);
      }
    }
  }

  // Once a brand-new category has been created, `categories` only updates
  // after router.refresh() re-renders the parent Server Component with a
  // fresh list - this effect waits for that new category to actually show
  // up in props, then checks its box.
  useEffect(() => {
    if (!pendingCategoryName) return;
    const match = findMatchingCategory(pendingCategoryName);
    const form = formRef.current;
    if (!match || !form) return;

    for (const checkbox of getCategoryCheckboxes(form)) {
      if (checkbox.value === match.id) checkbox.checked = true;
    }
    setCategoryMatchNote(`Created and selected category: ${match.name}`);
    setUnmatchedCategory(null);
    setPendingCategoryName(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, pendingCategoryName]);

  function handleCreateCategory(name: string) {
    startCreateCategory(async () => {
      const formData = new FormData();
      formData.set("name", name);
      const result = await createCategoryAction({ success: false, message: "" }, formData);

      if (!result.success) {
        setCategoryMatchNote(`Couldn't create category "${name}": ${result.message}`);
        return;
      }

      setPendingCategoryName(name);
      router.refresh();
    });
  }

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      const clearHandler = setTimeout(() => {
        if (trimmed.length === 0) setResults([]);
      }, 0);
      return () => clearTimeout(clearHandler);
    }

    const handler = setTimeout(() => {
      setSearchError("");
      startSearch(async () => {
        try {
          const found = await searchBooksAction(trimmed);
          setResults(found);
          if (found.length === 0) setSearchError("No matches found. Try a different title or ISBN.");
        } catch {
          setSearchError("Search failed. Please try again.");
        }
      });
    }, 700);

    return () => clearTimeout(handler);
  }, [query]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 3) return;
    setSearchError("");
    startSearch(async () => {
      try {
        const found = await searchBooksAction(trimmed);
        setResults(found);
        if (found.length === 0) setSearchError("No matches found. Try a different title or ISBN.");
      } catch {
        setSearchError("Search failed. Please try again.");
      }
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, author, or ISBN..."
          className="flex-1 bg-[#111] border border-gray-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-transparent transition-all"
        />
        <button
          type="submit"
          disabled={isSearching || query.trim().length < 2}
          className="bg-[#F4F3EE] text-[#111] font-semibold px-6 py-3 sm:py-0 rounded-md hover:bg-white transition-colors disabled:opacity-50"
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
      </form>
      <p className="sm:-mt-6 text-xs text-gray-500">
        Search the exact title only - skip extra words like a language name or edition (e.g. use{" "}
        <span className="text-gray-400">Azadi</span>, not{" "}
        <span className="text-gray-400">Azadi - Malayalam</span>). Results are merged from Google Books and Open
        Library.
      </p>

      {searchError && <p className="text-sm text-gray-400">{searchError}</p>}

      {!selected && (
        <button
          type="button"
          onClick={() => {
            setPasteText("");
            setSelected(BLANK_MANUAL);
          }}
          className="text-sm text-accent hover:underline"
        >
          Can&apos;t find this book? Add it manually &rarr;
        </button>
      )}

      {results.length > 0 && !selected && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((r) => (
            <button
              key={`${r.source}-${r.sourceId}`}
              onClick={() => setSelected(r)}
              className="text-left bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 hover:border-accent/60 transition-colors flex flex-col gap-2"
            >
              <div className="relative aspect-[2/3] w-full bg-gray-900 rounded overflow-hidden">
                {r.thumbnail ? (
                  <Image
                    src={r.thumbnail}
                    alt={r.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    unoptimized={!isOptimizableImageUrl(r.thumbnail)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    No cover
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F4F3EE] line-clamp-2">{r.title}</p>
                <p className="text-xs text-gray-500 line-clamp-1">{r.authors.join(", ") || "Unknown author"}</p>
                <span className="text-[10px] uppercase tracking-wide text-gray-600">{r.source}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#F4F3EE]">
              {selected.source === "manual" ? "Add Book Manually" : "Review & Save"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setPasteText("");
                setSelected(null);
              }}
              className="text-sm text-gray-400 hover:text-accent transition-colors"
            >
              &larr; {selected.source === "manual" ? "Cancel" : "Back to results"}
            </button>
          </div>

          {state.message && !state.success && (
            <div className="mb-6 p-3 bg-red-900/50 border border-red-500 text-red-200 rounded text-sm">
              {state.message}
            </div>
          )}

          <div className="mb-6 p-4 bg-[#111] border border-gray-700 rounded-md space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Paste details from ChatGPT <span className="text-gray-600">(optional - see prompt template)</span>
            </label>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              placeholder={"Title: ...\nAuthor: ...\nLanguage: ...\nCategory: ...\nDescription: ..."}
              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/60 resize-none"
            />
            <button
              type="button"
              onClick={fillFieldsFromPaste}
              disabled={!pasteText.trim()}
              className="text-sm bg-[#F4F3EE] text-[#111] font-semibold px-4 py-1.5 rounded-md hover:bg-white transition-colors disabled:opacity-50"
            >
              Fill fields from pasted text
            </button>
            {categoryMatchNote && (
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-gray-400">{categoryMatchNote}</p>
                {unmatchedCategory && (
                  <button
                    type="button"
                    onClick={() => handleCreateCategory(unmatchedCategory)}
                    disabled={isCreatingCategory}
                    className="text-xs text-accent hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {isCreatingCategory ? "Creating..." : `+ Create "${unmatchedCategory}" category`}
                  </button>
                )}
              </div>
            )}
          </div>

          <form ref={formRef} key={`${selected.source}-${selected.sourceId}`} action={formAction} className="space-y-6">
            <input type="hidden" name="source" value={selected.source} />
            <input type="hidden" name="sourceId" value={selected.sourceId} />

            <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">
              <div className="relative aspect-[2/3] w-full bg-gray-900 rounded overflow-hidden">
                {selected.thumbnail ? (
                  <Image
                    src={selected.thumbnail}
                    alt={selected.title}
                    fill
                    className="object-cover"
                    sizes="140px"
                    unoptimized={!isOptimizableImageUrl(selected.thumbnail)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                    No cover
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                  <input
                    name="title"
                    defaultValue={selected.title}
                    required
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Authors (comma separated)</label>
                  <input
                    name="authors"
                    defaultValue={selected.authors.join(", ")}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Publisher</label>
                  <input
                    name="publisher"
                    defaultValue={selected.publisher ?? ""}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Published Date</label>
                  <input
                    name="publishedDate"
                    defaultValue={selected.publishedDate ?? ""}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Language{" "}
                    <span className="text-gray-600">
                      {selected.language ? "(auto-filled - verify it)" : "(not detected - please set)"}
                    </span>
                  </label>
                  <input
                    name="language"
                    list="language-options"
                    defaultValue={selected.language ?? "English"}
                    required
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ISBN-10</label>
                  <input
                    name="isbn10"
                    defaultValue={selected.isbn10 ?? ""}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">ISBN-13</label>
                  <input
                    name="isbn13"
                    defaultValue={selected.isbn13 ?? ""}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Page Count</label>
                  <input
                    type="number"
                    name="pageCount"
                    defaultValue={selected.pageCount ?? ""}
                    min={0}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Image URL {selected.source !== "manual" && <span className="text-gray-600">(override)</span>}
                  </label>
                  <input
                    name="coverImageUrl"
                    defaultValue={selected.thumbnail ?? ""}
                    required={selected.source === "manual"}
                    className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60"
                  />
                  {selected.source === "manual" && (
                    <p className="mt-1.5 text-xs text-gray-500">
                      Open the book&apos;s page on the source site, right-click the cover &rarr; &quot;Copy Image
                      Address&quot;, and paste it here.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                defaultValue={selected.description}
                rows={4}
                className="w-full bg-[#111] border border-gray-700 rounded-md py-2.5 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent/60 resize-none"
              />
            </div>

            <PricingFields defaultPrice={selected.price} priceHint="(auto-filled if available)" />

            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Categories</label>
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 text-sm text-gray-300 bg-[#111] border border-gray-700 rounded-full px-3 py-1.5 cursor-pointer"
                    >
                      <input type="checkbox" name="categoryIds" value={category.id} className="accent-accent" />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <SaveButton />
          </form>
        </div>
      )}

      <datalist id="language-options">
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang} value={lang} />
        ))}
      </datalist>
    </div>
  );
}
