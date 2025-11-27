'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface GridProps {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg';
  responsive?: boolean;
  className?: string;
  children?: ReactNode;
}

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

const colsMap = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
};

const responsiveColsMap = {
  1: 'sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
  2: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2',
  3: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  6: 'sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  12: 'sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12',
};

/**
 * Grid layout component with responsive support
 *
 * @example
 * ```tsx
 * // Basic grid with 3 columns
 * <Grid cols={3} gap="md">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Grid>
 *
 * // Responsive grid (1 col on mobile, 2 on tablet, 3 on desktop)
 * <Grid cols={3} gap="lg" responsive>
 *   <Card>...</Card>
 *   <Card>...</Card>
 *   <Card>...</Card>
 * </Grid>
 *
 * // 12-column grid system
 * <Grid cols={12} gap="md">
 *   <div className="col-span-8">Main content</div>
 *   <div className="col-span-4">Sidebar</div>
 * </Grid>
 * ```
 */
export const Grid = ({
  cols = 1,
  gap = 'md',
  responsive = false,
  className,
  children,
}: GridProps) => {
  return (
    <div
      className={cn(
        'grid',
        responsive ? responsiveColsMap[cols] : colsMap[cols],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

Grid.displayName = 'Grid';
