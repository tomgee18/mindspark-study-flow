import { useState, useCallback, useEffect } from 'react';

/**
 * A hook for managing async operations
 * @param asyncFunction The async function to execute
 * @param immediate Whether to execute the function immediately
 * @param dependencies Dependencies that trigger re-execution when changed
 * @returns An object containing the status, value, error, and execute function
 */
export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = true,
  dependencies: any[] = []
) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  // The execute function wraps asyncFunction and
  // handles setting state for pending, value, and error.
  // useCallback ensures the function is not recreated on each render.
  const execute = useCallback(() => {
    setStatus('pending');
    setValue(null);
    setError(null);

    return asyncFunction()
      .then(response => {
        setValue(response);
        setStatus('success');
        return response;
      })
      .catch(error => {
        setError(error);
        setStatus('error');
        throw error;
      });
  }, [asyncFunction]);

  // Call execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate, execute, ...dependencies]);

  return { execute, status, value, error };
}