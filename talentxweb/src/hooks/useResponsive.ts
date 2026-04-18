import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface ResponsiveState {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
}

const BREAKPOINTS = {
  mobile: 0,
  tablet: 640,
  desktop: 1024,
  wide: 1440,
};

const getBreakpoint = (width: number): Breakpoint => {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
};

export const useResponsive = (): ResponsiveState => {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoint = getBreakpoint(width);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isWide: breakpoint === 'wide',
    width,
  };
};

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

export const useGridColumns = (
  defaultColumns: number,
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  }
): number => {
  const { breakpoint } = useResponsive();

  if (breakpoints) {
    switch (breakpoint) {
      case 'mobile':
        return breakpoints.mobile ?? 1;
      case 'tablet':
        return breakpoints.tablet ?? 2;
      case 'desktop':
        return breakpoints.desktop ?? defaultColumns;
      case 'wide':
        return breakpoints.wide ?? defaultColumns;
    }
  }

  return defaultColumns;
};
