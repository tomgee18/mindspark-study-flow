import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

// Example: Testing utility functions
describe('cn utility function', () => {
  it('combines class names correctly', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'hidden');
    expect(result).toBe('base conditional');
  });

  it('handles undefined and null values', () => {
    const result = cn('base', undefined, null, 'end');
    expect(result).toBe('base end');
  });

  it('merges Tailwind classes correctly', () => {
    const result = cn('p-4 p-2', 'bg-red-500 bg-blue-500');
    // Should keep the last conflicting class
    expect(result).toContain('p-2');
    expect(result).toContain('bg-blue-500');
    expect(result).not.toContain('p-4');
    expect(result).not.toContain('bg-red-500');
  });
});

// Example: Testing a more complex utility function
describe('formatDate utility', () => {
  const formatDate = (date: Date, format: 'short' | 'long' = 'short') => {
    if (format === 'long') {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    return date.toLocaleDateString('en-US');
  };

  it('formats date in short format by default', () => {
    const date = new Date('2023-12-25');
    const result = formatDate(date);
    expect(result).toBe('12/25/2023');
  });

  it('formats date in long format when specified', () => {
    const date = new Date('2023-12-25');
    const result = formatDate(date, 'long');
    expect(result).toBe('December 25, 2023');
  });
});

// Example: Testing error handling in utilities
describe('safeParseJSON utility', () => {
  const safeParseJSON = <T>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  };

  it('parses valid JSON correctly', () => {
    const result = safeParseJSON('{"key": "value"}', {});
    expect(result).toEqual({ key: 'value' });
  });

  it('returns fallback for invalid JSON', () => {
    const fallback = { default: true };
    const result = safeParseJSON('invalid json', fallback);
    expect(result).toBe(fallback);
  });

  it('handles different data types', () => {
    expect(safeParseJSON('123', 0)).toBe(123);
    expect(safeParseJSON('"string"', '')).toBe('string');
    expect(safeParseJSON('true', false)).toBe(true);
    expect(safeParseJSON('[1,2,3]', [])).toEqual([1, 2, 3]);
  });
});