export interface ParsedBookDetails {
  title?: string;
  authors?: string;
  language?: string;
  category?: string;
  description?: string;
}

const FIELD_PATTERN = /^\s*(title|author|authors|language|category|description)\s*:\s*(.*)$/i;

// Parses the "Title: ...\nAuthor: ...\nLanguage: ...\nCategory: ...\nDescription: ..."
// block an admin gets back from ChatGPT (see the prompt template) and pulls
// out each field. Description is treated as "everything from the
// Description: line to the end of the text" so a multi-line/multi-paragraph
// summary still comes through as one field instead of getting cut at the
// first line break - which is also why it must be the last field in the
// prompt's output format.
export function parsePastedBookDetails(text: string): ParsedBookDetails {
  const result: ParsedBookDetails = {};
  const lines = text.split(/\r?\n/);
  let descriptionLines: string[] | null = null;

  for (const line of lines) {
    if (descriptionLines !== null) {
      descriptionLines.push(line);
      continue;
    }

    const match = line.match(FIELD_PATTERN);
    if (!match) continue;

    const key = match[1].toLowerCase();
    const value = match[2].trim();

    if (key === "title") result.title = value;
    else if (key === "author" || key === "authors") result.authors = value;
    else if (key === "language") result.language = value;
    else if (key === "category") result.category = value;
    else if (key === "description") descriptionLines = [value];
  }

  if (descriptionLines) {
    result.description = descriptionLines.join("\n").trim();
  }

  return result;
}
