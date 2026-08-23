import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
    .replace(/\-\-+/g, '-');      // Replace multiple - with single -
}

export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback;
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    return fallback;
  }
}

export function formatPrice(price: string | number): string {
  if (typeof price === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  }
  if (!price) return '$0.00';
  if (price.startsWith('$') || price.startsWith('₹') || price.startsWith('€') || price.startsWith('£')) {
    return price;
  }
  return `$${price}`;
}

export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function estimateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}
