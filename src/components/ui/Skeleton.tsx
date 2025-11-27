'use client';

import { cn } from '@/lib/utils';

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'rectangle' | 'button';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export const Skeleton = ({
  className,
  variant = 'rectangle',
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}: SkeletonProps) => {
  const baseClasses = cn(
    'bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-700)]',
    animate && 'animate-pulse',
    className
  );

  const sizeStyles = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height
      ? typeof height === 'number'
        ? `${height}px`
        : height
      : undefined,
  };

  switch (variant) {
    case 'circle':
      return (
        <div
          className={cn(baseClasses, 'rounded-full')}
          style={{
            ...sizeStyles,
            width: width || height || '40px',
            height: width || height || '40px',
          }}
          {...props}
        />
      );

    case 'button':
      return (
        <div
          className={cn(baseClasses, 'rounded-[var(--radius-lg)]')}
          style={{
            ...sizeStyles,
            height: height || '40px',
            width: width || '100px',
          }}
          {...props}
        />
      );

    case 'text':
      return (
        <div className="space-y-2" {...props}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(baseClasses, 'rounded-[var(--radius-md)] h-4')}
              style={{
                width: i === lines - 1 ? '70%' : '100%',
              }}
            />
          ))}
        </div>
      );

    case 'rectangle':
    default:
      return (
        <div
          className={cn(baseClasses, 'rounded-[var(--radius-lg)]')}
          style={{
            ...sizeStyles,
            height: height || '120px',
          }}
          {...props}
        />
      );
  }
};

Skeleton.displayName = 'Skeleton';

/**
 * Skeleton loader for card components
 */
export const CardSkeleton = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="space-y-4" {...props}>
    <Skeleton variant="rectangle" height={200} />
    <div className="space-y-2 p-4">
      <Skeleton variant="text" lines={1} width="70%" />
      <Skeleton variant="text" lines={2} />
    </div>
  </div>
);

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Skeleton loader for list items
 */
export const ListSkeleton = (
  props: React.HTMLAttributes<HTMLDivElement> & { count?: number }
) => {
  const { count = 3, ...rest } = props;
  return (
    <div className="space-y-3" {...rest}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton variant="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" lines={1} width="60%" />
            <Skeleton variant="text" lines={1} width="80%" />
          </div>
        </div>
      ))}
    </div>
  );
};

ListSkeleton.displayName = 'ListSkeleton';
