import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert straight quotes/apostrophes to typographic (curly) ones.
export function smartQuotes(text: string): string {
  if (!text) return text
  return text
    .replace(/(^|[\s([{<\u2018\u201C])"/g, "$1\u201C") // opening "
    .replace(/"/g, "\u201D")                             // closing "
    .replace(/(^|[\s([{<])'/g, "$1\u2018")              // opening '
    .replace(/'/g, "\u2019")                             // closing ' / apostrophe
}
