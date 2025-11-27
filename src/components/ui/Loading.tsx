'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizeMap = {
  sm: { spinner: 'h-4 w-4', dot: 'h-1.5 w-1.5', container: 'gap-1' },
  md: { spinner: 'h-8 w-8', dot: 'h-2.5 w-2.5', container: 'gap-1.5' },
  lg: { spinner: 'h-12 w-12', dot: 'h-3.5 w-3.5', container: 'gap-2' },
};

const colorMap = {
  primary: 'text-[var(--color-primary)]',
  secondary: 'text-[var(--color-gray-600)] dark:text-[var(--color-gray-400)]',
  white: 'text-white',
};

const SpinnerVariant = ({ size, color }: { size: 'sm' | 'md' | 'lg'; color: string }) => (
  <motion.svg
    className={cn(sizeMap[size].spinner, color)}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </motion.svg>
);

const DotsVariant = ({ size, color }: { size: 'sm' | 'md' | 'lg'; color: string }) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  return (
    <div className={cn('flex items-center', sizeMap[size].container)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn('rounded-full', sizeMap[size].dot, color.replace('text-', 'bg-'))}
          variants={dotVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: 'reverse',
            delay: index * 0.15,
          }}
        />
      ))}
    </div>
  );
};

const PulseVariant = ({ size, color }: { size: 'sm' | 'md' | 'lg'; color: string }) => (
  <motion.div
    className={cn('rounded-full', sizeMap[size].spinner, color.replace('text-', 'bg-'))}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

/**
 * Loading component with multiple variants and animations
 *
 * @example
 * ```tsx
 * // Spinner variant (default)
 * <Loading />
 * <Loading size="lg" color="primary" />
 *
 * // Dots variant
 * <Loading variant="dots" />
 *
 * // Pulse variant
 * <Loading variant="pulse" size="md" color="secondary" />
 * ```
 */
export const Loading = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  className,
}: LoadingProps) => {
  const colorClass = colorMap[color];

  return (
    <div
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-label="Loading"
    >
      {variant === 'spinner' && <SpinnerVariant size={size} color={colorClass} />}
      {variant === 'dots' && <DotsVariant size={size} color={colorClass} />}
      {variant === 'pulse' && <PulseVariant size={size} color={colorClass} />}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Loading.displayName = 'Loading';
