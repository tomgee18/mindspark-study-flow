
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeText(text: string): string {
  // A basic sanitizer to remove script tags and prevent XSS.
  // For more robust sanitization, a library like DOMPurify would be better.
  return text.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

