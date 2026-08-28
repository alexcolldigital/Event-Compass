/**
 * Responsive utilities — shared across all screens.
 * Breakpoints mirror Tailwind: sm=640, md=768, lg=1024, xl=1280
 */

import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';

export const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;

export const getWindow = () => Dimensions.get('window');

export const isWeb = Platform.OS === 'web';

/** Returns number of grid columns based on current width */
export const getColumns = (width: number, opts?: { sm?: number; md?: number; lg?: number; xl?: number; base?: number }) => {
  const { base = 1, sm = 2, md = 2, lg = 3, xl = 4 } = opts ?? {};
  if (width >= BREAKPOINTS.xl) return xl;
  if (width >= BREAKPOINTS.lg) return lg;
  if (width >= BREAKPOINTS.md) return md;
  if (width >= BREAKPOINTS.sm) return sm;
  return base;
};

/** Horizontal padding that scales with screen width */
export const getHPad = (width: number) => {
  if (width >= BREAKPOINTS.xl) return 48;
  if (width >= BREAKPOINTS.lg) return 32;
  if (width >= BREAKPOINTS.md) return 24;
  return 16;
};

/** Max content width for wide screens */
export const MAX_CONTENT_WIDTH = 1200;

/** Clamp a content container to MAX_CONTENT_WIDTH */
export const contentStyle = (width: number) => ({
  width: '100%' as const,
  maxWidth: MAX_CONTENT_WIDTH,
  alignSelf: 'center' as const,
  paddingHorizontal: getHPad(width),
});

/** Hook that re-renders on dimension change (web resize, rotation) */
export const useResponsive = () => {
  const [dims, setDims] = useState<ScaledSize>(getWindow());

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setDims(window));
    return () => sub?.remove();
  }, []);

  const { width, height } = dims;
  const hPad = getHPad(width);
  const cols = (opts?: Parameters<typeof getColumns>[1]) => getColumns(width, opts);
  const isSmall = width < BREAKPOINTS.sm;
  const isMedium = width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg;
  const isLarge = width >= BREAKPOINTS.lg;

  /** Width of a single column item given gap and column count */
  const colWidth = (numCols: number, gap = 12) =>
    (width - hPad * 2 - gap * (numCols - 1)) / numCols;

  return { width, height, hPad, cols, colWidth, isSmall, isMedium, isLarge };
};
