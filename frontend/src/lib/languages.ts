// Common options for the admin language dropdown - the field itself is a
// free-text string on the backend (not an enum), so this list is just a
// convenience; an admin can still type something else if needed.
export const LANGUAGE_OPTIONS = [
  "English",
  "Malayalam",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Arabic",
] as const;
