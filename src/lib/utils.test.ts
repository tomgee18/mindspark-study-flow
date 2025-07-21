import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional class names', () => {
    const condition = true;
    const result = cn('class1', condition && 'class2', !condition && 'class3');
    expect(result).toBe('class1 class2');
  });

  it('should handle falsy values', () => {
    const result = cn('class1', false && 'class2', null, undefined, 0, '');
    expect(result).toBe('class1');
  });

  it('should handle object notation', () => {
    const result = cn('class1', { class2: true, class3: false });
    expect(result).toBe('class1 class2');
  });

  it('should handle array notation', () => {
    const result = cn('class1', ['class2', 'class3']);
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle complex combinations', () => {
    const condition1 = true;
    const condition2 = false;
    const result = cn(
      'class1',
      condition1 && 'class2',
      condition2 && 'class3',
      { class4: condition1, class5: condition2 },
      ['class6', condition1 && 'class7']
    );
    expect(result).toBe('class1 class2 class4 class6 class7');
  });
});