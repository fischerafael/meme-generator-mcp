/** `?t=` format: each text URI-encoded, joined by "|". A literal "|" inside a text is encoded, so splitting is safe. */
export function encodeTexts(texts: string[]): string {
  return texts.map(encodeURIComponent).join("|");
}

export function decodeTexts(raw: string | null): string[] {
  if (!raw) return [];
  return raw.split("|").map((part) => {
    try {
      return decodeURIComponent(part);
    } catch {
      return part;
    }
  });
}
