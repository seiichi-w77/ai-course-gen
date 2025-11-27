'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FlexProps {
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  gap?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
  children?: ReactNode;
}

const directionMap = {
  row: 'flex-row',
  col: 'flex-col',
};

const alignMap = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyMap = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

const gapMap = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
};

/**
 * Flexible box layout component
 *
 * @example
 * ```tsx
 * // Horizontal layout with center alignment
 * <Flex direction="row" align="center" justify="between">
 *   <div>Left</div>
 *   <div>Right</div>
 * </Flex>
 *
 * // Vertical stack with spacing
 * <Flex direction="col" gap="md">
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 *   <Button>Button 3</Button>
 * </Flex>
 *
 * // Centered content
 * <Flex align="center" justify="center" className="h-screen">
 *   <Loading />
 * </Flex>
 *
 * // Wrapping flex container
 * <Flex wrap gap="sm">
 *   <Badge>Tag 1</Badge>
 *   <Badge>Tag 2</Badge>
 *   <Badge>Tag 3</Badge>
 * </Flex>
 * ```
 */
export const Flex = ({
  direction = 'row',
  align = 'stretch',
  justify = 'start',
  gap,
  wrap = false,
  className,
  children,
}: FlexProps) => {
  return (
    <div
      className={cn(
        'flex',
        directionMap[direction],
        alignMap[align],
        justifyMap[justify],
        gap && gapMap[gap],
        wrap && 'flex-wrap',
        className
      )}
    >
      {children}
    </div>
  );
};

Flex.displayName = 'Flex';
