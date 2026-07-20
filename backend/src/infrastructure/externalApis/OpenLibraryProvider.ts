import { BookLookupResult, IBookLookupProvider } from "../../domain/repositories/IBookLookupProvider";
import { normalizeLanguageCode } from "../../shared/utils/languageNames";

interface OpenLibraryDoc {
  key: string;
  title?: string;
  author_name?: string[];
  isbn?: string[];
  publisher?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  language?: string[];
}

interface OpenLibrarySearchResponse {
  docs?: OpenLibraryDoc[];
}

// Open Library's search endpoint doesn't return a description; a full
// synopsis would require a second request per work, which isn't worth the
// extra round trips for a fallback provider - admins can fill it in manually.
export class OpenLibraryProvider implements IBookLookupProvider {
  private readonly baseUrl = "https://openlibrary.org/search.json";

  async search(query: string): Promise<BookLookupResult[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "12");

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`Open Library API responded with ${res.status}`);
    }

    const data = (await res.json()) as OpenLibrarySearchResponse;
    const results = (data.docs ?? []).map((doc) => this.toResult(doc));

    await Promise.all(
      results.map(async (result) => {
        if (!result.sourceId) return;
        try {
          const detailRes = await fetch(`https://openlibrary.org${result.sourceId}.json`);
          if (detailRes.ok) {
            const detail = (await detailRes.json()) as any;
            if (typeof detail.description === "string") {
              result.description = detail.description;
            } else if (detail.description && typeof detail.description.value === "string") {
              result.description = detail.description.value;
            }
          }
        } catch {
          // Ignore detail fetch errors
        }
      })
    );

    return results;
  }

  private toResult(doc: OpenLibraryDoc): BookLookupResult {
    const isbns = doc.isbn ?? [];
    const isbn13 = isbns.find((code) => code.length === 13);
    const isbn10 = isbns.find((code) => code.length === 10);

    return {
      source: "openlibrary",
      sourceId: doc.key,
      title: doc.title ?? "Untitled",
      authors: doc.author_name ?? [],
      description: "",
      isbn10,
      isbn13,
      publisher: doc.publisher?.[0],
      publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      pageCount: doc.number_of_pages_median,
      thumbnail: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : undefined,
      language: doc.language?.[0] ? normalizeLanguageCode(doc.language[0]) : undefined,
    };
  }
}
