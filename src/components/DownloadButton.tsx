'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/Button';
import { downloadFile, isValidDownloadUrl } from '@/lib/download';
import { cn } from '@/lib/utils';

/**
 * Props for the DownloadButton component
 */
export interface DownloadButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** URL of the file to download */
  url: string;
  /** Filename to save as */
  filename: string;
  /** Content to display in the button */
  children: React.ReactNode;
  /** Callback when download starts */
  onDownloadStart?: () => void;
  /** Callback when download completes */
  onDownloadComplete?: () => void;
  /** Callback when download fails */
  onDownloadError?: (error: Error) => void;
  /** Show progress bar */
  showProgress?: boolean;
  /** Validate URL before downloading */
  validateUrl?: boolean;
}

/**
 * Download button with progress tracking
 *
 * @example
 * ```tsx
 * <DownloadButton
 *   url="https://example.com/document.pdf"
 *   filename="document.pdf"
 *   showProgress
 * >
 *   Download PDF
 * </DownloadButton>
 * ```
 */
export function DownloadButton({
  url,
  filename,
  children,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  showProgress = true,
  validateUrl = true,
  variant = 'primary',
  size = 'md',
  className,
  ...buttonProps
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    // Reset state
    setError(null);
    setProgress(0);

    // Validate URL if enabled
    if (validateUrl && !isValidDownloadUrl(url)) {
      const validationError = new Error('Invalid download URL');
      setError(validationError.message);
      onDownloadError?.(validationError);
      return;
    }

    try {
      setIsDownloading(true);
      onDownloadStart?.();

      // Download with progress tracking
      await downloadFile(url, filename, (progressValue) => {
        setProgress(progressValue);
      });

      onDownloadComplete?.();
    } catch (err) {
      const downloadError =
        err instanceof Error ? err : new Error('Download failed');
      setError(downloadError.message);
      onDownloadError?.(downloadError);
    } finally {
      setIsDownloading(false);
      // Keep progress visible briefly before resetting
      setTimeout(() => {
        setProgress(0);
      }, 1000);
    }
  }, [
    url,
    filename,
    validateUrl,
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
  ]);

  return (
    <div className="relative inline-flex flex-col gap-2">
      <Button
        variant={variant}
        size={size}
        className={cn('relative overflow-hidden', className)}
        onClick={handleDownload}
        isLoading={isDownloading}
        disabled={isDownloading}
        leftIcon={
          !isDownloading && (
            <DownloadIcon className="w-4 h-4" />
          )
        }
        {...buttonProps}
      >
        {/* Progress overlay */}
        <AnimatePresence>
          {showProgress && isDownloading && progress > 0 && (
            <motion.div
              className="absolute inset-0 bg-white/20 dark:bg-black/20"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: 'left' }}
            />
          )}
        </AnimatePresence>

        {/* Button content */}
        <span className="relative z-10">
          {isDownloading && showProgress ? `${progress}%` : children}
        </span>
      </Button>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-[var(--color-error)] px-1"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Download icon component
 */
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Compact download button with circular progress indicator
 *
 * @example
 * ```tsx
 * <DownloadButtonCompact
 *   url="https://example.com/file.pdf"
 *   filename="file.pdf"
 * />
 * ```
 */
export function DownloadButtonCompact({
  url,
  filename,
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  className,
}: Pick<
  DownloadButtonProps,
  | 'url'
  | 'filename'
  | 'onDownloadStart'
  | 'onDownloadComplete'
  | 'onDownloadError'
  | 'className'
>) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = useCallback(async () => {
    if (!isValidDownloadUrl(url)) {
      onDownloadError?.(new Error('Invalid URL'));
      return;
    }

    try {
      setIsDownloading(true);
      setProgress(0);
      onDownloadStart?.();

      await downloadFile(url, filename, setProgress);

      onDownloadComplete?.();
    } catch (err) {
      onDownloadError?.(
        err instanceof Error ? err : new Error('Download failed')
      );
    } finally {
      setIsDownloading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [url, filename, onDownloadStart, onDownloadComplete, onDownloadError]);

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full',
        'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]',
        'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        className
      )}
      aria-label={`Download ${filename}`}
    >
      {/* Circular progress indicator */}
      {isDownloading && (
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 36 36"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.2"
          />
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="100"
            initial={{ strokeDashoffset: 100 }}
            animate={{ strokeDashoffset: 100 - progress }}
            transition={{ duration: 0.2 }}
          />
        </svg>
      )}

      {/* Download icon */}
      <DownloadIcon className={cn('w-5 h-5', isDownloading && 'opacity-50')} />
    </button>
  );
}

DownloadButton.displayName = 'DownloadButton';
DownloadButtonCompact.displayName = 'DownloadButtonCompact';
