import { apiClient } from "@/lib/dal/apiClient";
import { Author } from "@/types/author";
import AuthorCarouselRow from "@/components/AuthorCarouselRow";

export default async function AuthorSection() {
  const { authors: allAuthors } = await apiClient.get<{ authors: Author[] }>("/authors");
  // Only show authors with a real photo here - a wall of blank
  // placeholder-letter circles isn't worth showing on the storefront, even
  // though the admin author list still shows everyone so those gaps are
  // easy to find and fill in.
  const authors = allAuthors.filter((author) => author.imageUrl);

  if (authors.length === 0) return null;

  return (
    <section id="authors" className="bg-paper px-6 md:px-8 py-16 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4">
            <span className="h-px w-8 bg-accent/60" />
            Browse By
            <span className="h-px w-8 bg-accent/60" />
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-ink">Browse By Authors</h2>
          <p className="text-gray-600 mt-3 max-w-lg mx-auto">
            Discover books from your favourite Malayalam and English authors
          </p>
        </div>

        <AuthorCarouselRow authors={authors} />
      </div>
    </section>
  );
}
