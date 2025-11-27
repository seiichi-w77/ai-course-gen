'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Avatar type definition
 */
export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * AvatarSelector component props
 */
export interface AvatarSelectorProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  avatars: Avatar[];
  selectedId: string | null;
  onSelect: (avatar: Avatar) => void;
  className?: string;
}

/**
 * AvatarSelector - Grid-based avatar selection component with animations
 *
 * @example
 * ```tsx
 * const avatars = [
 *   { id: '1', name: 'Professor Oak', imageUrl: '/avatars/oak.png' },
 *   { id: '2', name: 'Dr. Smith', imageUrl: '/avatars/smith.png' },
 * ];
 *
 * <AvatarSelector
 *   avatars={avatars}
 *   selectedId={selectedId}
 *   onSelect={(avatar) => setSelectedId(avatar.id)}
 * />
 * ```
 */
export const AvatarSelector = forwardRef<HTMLDivElement, AvatarSelectorProps>(
  (
    {
      avatars,
      selectedId,
      onSelect,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
        {...props}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {avatars.map((avatar, index) => {
            const isSelected = avatar.id === selectedId;

            return (
              <motion.button
                key={avatar.id}
                type="button"
                onClick={() => onSelect(avatar)}
                className={cn(
                  'relative flex flex-col items-center gap-3 p-4 rounded-[var(--radius-xl)]',
                  'transition-all duration-[var(--transition-base)]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
                  'hover:bg-[var(--surface-hover)]',
                  isSelected
                    ? 'bg-[var(--surface-hover)] border-2 border-[var(--color-primary)]'
                    : 'bg-[var(--surface)] border-2 border-[var(--border)]'
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  delay: index * 0.05,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Avatar Image */}
                <div
                  className={cn(
                    'relative w-20 h-20 rounded-full overflow-hidden',
                    'ring-2 transition-all duration-[var(--transition-base)]',
                    isSelected
                      ? 'ring-[var(--color-primary)] ring-offset-2'
                      : 'ring-[var(--border)] ring-offset-0'
                  )}
                >
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to a placeholder on image load error
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='32' fill='%239ca3af'%3E${avatar.name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
                    }}
                  />
                </div>

                {/* Avatar Name */}
                <span
                  className={cn(
                    'text-sm font-medium text-center transition-colors duration-[var(--transition-fast)]',
                    isSelected
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--foreground)]'
                  )}
                >
                  {avatar.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }
);

AvatarSelector.displayName = 'AvatarSelector';
