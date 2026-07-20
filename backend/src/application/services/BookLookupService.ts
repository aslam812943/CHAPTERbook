import { BookLookupResult, IBookLookupProvider } from "../../domain/repositories/IBookLookupProvider";

// Queries every configured provider concurrently and merges the results,
// rather than "try provider A, only fall back to B if A returned nothing" -
// the old strategy meant a provider that returned a handful of loosely
// relevant matches would silently suppress a better match sitting in the
// other provider's catalog. Adding a third provider (e.g. a source with
// stronger regional-language coverage) is just adding it to the array
// passed into the constructor - no changes needed here.
export class BookLookupService {
  constructor(private readonly providers: IBookLookupProvider[]) {}

  async search(query: string): Promise<BookLookupResult[]> {
    const outcomes = await Promise.allSettled(this.providers.map((provider) => provider.search(query)));

    const results: BookLookupResult[] = [];
    outcomes.forEach((outcome, index) => {
      if (outcome.status === "fulfilled") {
        results.push(...outcome.value);
      } else {
        console.error(
          `[BookLookupService] provider #${index} (${this.providers[index].constructor.name}) failed:`,
          outcome.reason
        );
      }
    });

    return dedupe(results);
  }
}

function dedupe(results: BookLookupResult[]): BookLookupResult[] {
  const seen = new Set<string>();
  const deduped: BookLookupResult[] = [];

  for (const result of results) {
    const key = dedupeKey(result);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }

  return deduped;
}

function dedupeKey(result: BookLookupResult): string {
  if (result.isbn13) return `isbn:${result.isbn13}`;
  if (result.isbn10) return `isbn:${result.isbn10}`;
  return `title:${result.title.trim().toLowerCase()}|${result.authors.join(",").trim().toLowerCase()}`;
}
