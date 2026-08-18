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
 * Returns a randomized subset of quotes.
 */
export function getRandomQuoteSet(count: number = 36): Quote[] {
  const shuffled = [...POP_CULTURE_QUOTES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, POP_CULTURE_QUOTES.length));
}
