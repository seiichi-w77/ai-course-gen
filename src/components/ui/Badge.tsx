'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  onClose?: () => void;
  pill?: boolean;
}

const badgeVariants = {
  default:
    'bg-[var(--color-gray-200)] text-[var(--color-gray-900)] dark:bg-[var(--color-gray-700)] dark:text-[var(--color-gray-100)]',
  primary: 'bg-[var(--color-primary)] bg-opacity-15 text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)] bg-opacity-15 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)] bg-opacity-15 text-[var(--color-warning)]',
  error: 'bg-[var(--color-error)] bg-opacity-15 text-[var(--color-error)]',
  info: 'bg-[var(--color-info)] bg-opacity-15 text-[var(--color-info)]',
};

const badgeSizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      icon,
      onClose,
      pill = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium transition-all duration-[var(--transition-fast)]',
          badgeVariants[variant],
          badgeSizes[size],
          pill ? 'rounded-full' : 'rounded-[var(--radius-md)]',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="flex-shrink-0">{children}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex-shrink-0 ml-1',
              'hover:opacity-80 focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-current focus-visible:ring-offset-0',
              'transition-opacity duration-[var(--transition-fast)]',
              'rounded-[var(--radius-sm)]',
              'p-0.5'
            )}
            aria-label="Remove badge"
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

/**
 * Badge Group component for displaying multiple badges
 */
export interface BadgeGroupProps extends HTMLAttributes<HTMLDivElement> {
  badges: Array<{
    id: string;
    label: string;
    variant?: BadgeProps['variant'];
    icon?: React.ReactNode;
  }>;
  onRemove?: (id: string) => void;
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
}

export const BadgeGroup = forwardRef<HTMLDivElement, BadgeGroupProps>(
  ({ className, badges, onRemove, size = 'md', pill = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap gap-2', className)}
        {...props}
      >
        {badges.map((badge) => (
          <Badge
            key={badge.id}
            variant={badge.variant}
            size={size}
            icon={badge.icon}
            onClose={onRemove ? () => onRemove(badge.id) : undefined}
            pill={pill}
          >
            {badge.label}
          </Badge>
        ))}
      </div>
    );
  }
);

BadgeGroup.displayName = 'BadgeGroup';
