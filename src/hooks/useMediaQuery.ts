import { useState, useEffect } from 'react';

/**
 * A hook that returns whether a media query matches
 * @param query The media query to match
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Prevent build error "window is undefined" but keep working
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * A hook that returns whether the device is in dark mode
 * @returns Whether the device is in dark mode
 */
export function useDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * A hook that returns whether the device is in light mode
 * @returns Whether the device is in light mode
 */
export function useLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

/**
 * A hook that returns whether the device is a mobile device
 * @returns Whether the device is a mobile device
 */
export function useMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

/**
 * A hook that returns whether the device is a tablet device
 * @returns Whether the device is a tablet device
 */
export function useTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

/**
 * A hook that returns whether the device is a desktop device
 * @returns Whether the device is a desktop device
 */
export function useDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}