const UTF8_BOM = "\uFEFF";

function escapeCsvField(value: string | number): string {
  const str = String(value);
  // RFC 4180: quote any field containing a comma, quote, or newline, and
  // double up any internal quotes.
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(","));
  // UTF-8 BOM - without it, Excel guesses the encoding and can mangle
  // non-ASCII text (this catalog has Malayalam book titles that can end up
  // in an order's item list).
  return UTF8_BOM + lines.join("\r\n");
}
