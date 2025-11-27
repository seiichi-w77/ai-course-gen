'use client';

import {
  forwardRef,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  children: React.ReactNode;
  className?: string;
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const CloseIcon = () => (
  <svg
    width="24"
    height="24"
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      description,
      size = 'md',
      closeButton = true,
      children,
      className,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLDivElement>(null);
    const modalRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Focus trap implementation
    useEffect(() => {
      if (!isOpen) return;

      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Get focusable elements
      const getFocusableElements = () => {
        if (!modalRef.current) return [];
        return Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          const focusableElements = getFocusableElements();
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      // Focus first focusable element or modal container
      setTimeout(() => {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus to previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }, [isOpen, onClose, modalRef]);

    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              ref={modalRef}
              className={cn(
                'fixed inset-0 z-50 flex items-center justify-center p-4',
              )}
              onClick={handleBackdropClick}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby={title ? 'modal-title' : undefined}
              aria-describedby={description ? 'modal-description' : undefined}
              tabIndex={-1}
            >
              <div
                className={cn(
                  'p-0 rounded-[var(--radius-lg)] border border-[var(--border)]',
                  'bg-[var(--surface)] text-[var(--foreground)]',
                  'shadow-lg',
                  'w-full',
                  modalSizes[size],
                  className
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-[var(--border)]">
                  <div className="flex-1">
                    {title && (
                      <h2 id="modal-title" className="text-xl font-semibold text-[var(--foreground)]">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p id="modal-description" className="mt-1 text-sm text-[var(--color-gray-500)]">
                        {description}
                      </p>
                    )}
                  </div>
                  {closeButton && (
                    <button
                      type="button"
                      onClick={onClose}
                      className={cn(
                        'ml-4 flex-shrink-0 text-[var(--color-gray-400)] hover:text-[var(--foreground)]',
                        'transition-colors duration-[var(--transition-fast)]',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                        'rounded-[var(--radius-md)]'
                      )}
                      aria-label="Close modal"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                  {children}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }
);

Modal.displayName = 'Modal';
