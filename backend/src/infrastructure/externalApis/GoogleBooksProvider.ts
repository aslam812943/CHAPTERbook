import { BookLookupResult, IBookLookupProvider } from "../../domain/repositories/IBookLookupProvider";
import { env } from "../../config/env";
import { normalizeLanguageCode } from "../../shared/utils/languageNames";

interface GoogleVolumeItem {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    language?: string;
  };
  saleInfo?: {
    listPrice?: { amount: number };
  };
}

interface GoogleVolumesResponse {
  items?: GoogleVolumeItem[];
}

export class GoogleBooksProvider implements IBookLookupProvider {
  private readonly baseUrl = "https://www.googleapis.com/books/v1/volumes";

  async search(query: string): Promise<BookLookupResult[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("q", query);
    url.searchParams.set("maxResults", "12");
    if (env.GOOGLE_BOOKS_API_KEY) {
      url.searchParams.set("key", env.GOOGLE_BOOKS_API_KEY);
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      if (res.status === 429) {
        console.warn("[GoogleBooksProvider] Rate limit hit (429), skipping Google Books results.");
        return [];
      }
      console.warn(`[GoogleBooksProvider] API responded with ${res.status}`);
      return [];
    }

    const data = (await res.json()) as GoogleVolumesResponse;
    return (data.items ?? []).map((item) => this.toResult(item));
  }

  private toResult(item: GoogleVolumeItem): BookLookupResult {
    const info = item.volumeInfo ?? {};
    const identifiers = info.industryIdentifiers ?? [];
    const isbn10 = identifiers.find((id) => id.type === "ISBN_10")?.identifier;
    const isbn13 = identifiers.find((id) => id.type === "ISBN_13")?.identifier;
    const thumbnail = info.imageLinks?.thumbnail?.replace(/^http:/, "https:");
    const price = item.saleInfo?.listPrice?.amount;
    const language = info.language ? normalizeLanguageCode(info.language) : undefined;

    return {
      source: "google",
      sourceId: item.id,
      title: info.title ?? "Untitled",
      authors: info.authors ?? [],
      description: info.description ?? "",
      isbn10,
      isbn13,
      publisher: info.publisher,
      publishedDate: info.publishedDate,
      pageCount: info.pageCount,
      thumbnail,
      price,
      language,
    };
  }
}
