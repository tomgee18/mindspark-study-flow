import { useState, useCallback } from 'react';

/**
 * A hook for managing boolean toggle state
 * @param initialValue The initial boolean value
 * @returns A tuple containing the current value, a toggle function, and setter functions
 */
export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setValue];
}