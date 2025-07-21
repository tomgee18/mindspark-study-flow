import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '@/hooks/useToggle';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Example: Testing a custom hook
describe('useToggle Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggles value when toggle function is called', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(true);
    
    act(() => {
      result.current[1]();
    });
    
    expect(result.current[0]).toBe(false);
  });

  it('sets value when setValue function is called', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[2](true);
    });
    
    expect(result.current[0]).toBe(true);
  });
});

// Example: Testing a hook with localStorage
describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('initializes with default value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('initializes with value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    expect(result.current[0]).toBe('stored-value');
  });

  it('updates localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
  });

  it('handles localStorage errors gracefully', () => {
    // Mock localStorage to throw an error
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn(() => {
      throw new Error('Storage full');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    // Should not throw an error
    act(() => {
      result.current[1]('new-value');
    });
    
    // Restore original localStorage
    localStorage.setItem = originalSetItem;
  });
});