import quotesData from "@/public/data/quotes.json";

export interface Quote {
  id: number;
  text: string;
  source: string;
}

export const POP_CULTURE_QUOTES: Quote[] = quotesData as Quote[];

/**
 * Formats quote text with source attribution for display.
 */
export function formatQuote(quote: Quote): string {
  return `"${quote.text}" — ${quote.source}`;
}

/**
 * Returns a randomized subset of quotes, optionally excluding specific quote IDs.
 */
export function getRandomQuoteSet(count: number = 36, excludeIds: number[] = []): Quote[] {
  let pool = POP_CULTURE_QUOTES;
  if (excludeIds && excludeIds.length > 0) {
    const filtered = POP_CULTURE_QUOTES.filter((q) => !excludeIds.includes(q.id));
    if (filtered.length >= count) {
      pool = filtered;
    }
  }

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}

