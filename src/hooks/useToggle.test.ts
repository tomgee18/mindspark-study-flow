import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from './useToggle';

describe('useToggle', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useToggle());
    
    expect(result.current[0]).toBe(false);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true));
    
    expect(result.current[0]).toBe(true);
  });

  it('should toggle the value when toggle function is called', () => {
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

  it('should set the value to true when setTrue function is called', () => {
    const { result } = renderHook(() => useToggle(false));
    
    act(() => {
      result.current[2]();
    });
    
    expect(result.current[0]).toBe(true);
    
    // Call setTrue again to ensure it stays true
    act(() => {
      result.current[2]();
    });
    
    expect(result.current[0]).toBe(true);
  });

  it('should set the value to false when setFalse function is called', () => {
    const { result } = renderHook(() => useToggle(true));
    
    act(() => {
      result.current[3]();
    });
    
    expect(result.current[0]).toBe(false);
    
    // Call setFalse again to ensure it stays false
    act(() => {
      result.current[3]();
    });
    
    expect(result.current[0]).toBe(false);
  });
});