// Maps the language codes external book APIs return into human-readable
// names for the admin UI. Google Books uses ISO 639-1 (2-letter, e.g. "en"),
// Open Library uses ISO 639-2/B (3-letter, e.g. "eng"). Falls back to the
// raw code (title-cased) for anything not in this list rather than dropping
// the value - an unfamiliar code is still more useful to an admin than "".
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  eng: "English",
  ml: "Malayalam",
  mal: "Malayalam",
  hi: "Hindi",
  hin: "Hindi",
  ta: "Tamil",
  tam: "Tamil",
  te: "Telugu",
  tel: "Telugu",
  kn: "Kannada",
  kan: "Kannada",
  ur: "Urdu",
  urd: "Urdu",
  fr: "French",
  fre: "French",
  fra: "French",
  es: "Spanish",
  spa: "Spanish",
  de: "German",
  ger: "German",
  deu: "German",
  ar: "Arabic",
  ara: "Arabic",
};

export function normalizeLanguageCode(code: string): string {
  const known = LANGUAGE_NAMES[code.trim().toLowerCase()];
  if (known) return known;
  const trimmed = code.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
