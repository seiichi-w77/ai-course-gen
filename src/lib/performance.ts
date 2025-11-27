/**
 * Performance utilities for optimizing application loading and rendering
 */

import dynamic from 'next/dynamic';
import type { ComponentType, ReactElement } from 'react';

/**
 * Type definition for Next.js Web Vitals metrics
 */
export interface NextWebVitalsMetric {
  id: string;
  name: string;
  label: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  navigationType?: string;
}

/**
 * Options for dynamic imports
 */
export interface DynamicImportOptions {
  ssr?: boolean;
  loading?: () => ReactElement;
}

/**
 * Utility function for dynamic imports with loading component
 *
 * This reduces initial bundle size by code-splitting heavy components
 * and loading them only when needed.
 *
 * @param importFn - Function that returns a dynamic import promise
 * @param options - Configuration options for the dynamic import
 * @returns A dynamically imported component
 *
 * @example
 * ```typescript
 * import { Loading } from '@/components/ui/Loading';
 *
 * const VideoPlayer = dynamicImport(
 *   () => import('@/components/ui/VideoPlayer'),
 *   { ssr: false, loading: () => <Loading /> }
 * );
 * ```
 */
export function dynamicImport<T extends ComponentType>(
  importFn: () => Promise<{ default: T } | T>,
  options: DynamicImportOptions = {}
): T {
  const { ssr = false, loading } = options;

  return dynamic(importFn, {
    ssr,
    loading,
  }) as T;
}

/**
 * Report Web Vitals metrics for performance monitoring
 *
 * This function can be called from Next.js's built-in Web Vitals reporting
 * to log or send metrics to an analytics service.
 *
 * Metrics reported:
 * - CLS (Cumulative Layout Shift)
 * - FID (First Input Delay)
 * - FCP (First Contentful Paint)
 * - LCP (Largest Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint)
 *
 * @param metric - The Web Vitals metric object
 *
 * @example
 * ```typescript
 * // In app/_app.tsx or app/layout.tsx
 * export { reportWebVitals } from '@/lib/performance';
 * ```
 */
export function reportWebVitals(metric: NextWebVitalsMetric): void {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vitals]', {
      name: metric.name,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      rating: metric.rating,
      label: metric.label,
    });
  }

  // In production, you can send to analytics service
  // Example: Send to Google Analytics, Vercel Analytics, etc.
  if (process.env.NODE_ENV === 'production') {
    // Example: analytics.track(metric.name, { value: metric.value });

    // Log critical metrics that need attention
    if (metric.rating === 'poor') {
      console.warn(`Poor Web Vital: ${metric.name}`, metric.value);
    }
  }
}

/**
 * Preload a resource for better performance
 *
 * @param href - The URL of the resource to preload
 * @param as - The type of resource (script, style, image, font, etc.)
 *
 * @example
 * ```typescript
 * preloadResource('/fonts/custom-font.woff2', 'font');
 * preloadResource('/critical-script.js', 'script');
 * ```
 */
export function preloadResource(href: string, as: string): void {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;

  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Check if the device prefers reduced motion
 * Useful for accessibility and performance
 *
 * @returns true if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Debounce function for performance optimization
 *
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 *
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
