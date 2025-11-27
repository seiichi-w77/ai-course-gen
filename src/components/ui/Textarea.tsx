'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  resizable?: boolean;
  characterCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      hint,
      resizable = true,
      characterCount = false,
      maxLength,
      id,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || props.name;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-[var(--foreground)] mb-2"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-4 py-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)]',
            'text-[var(--foreground)] placeholder:text-[var(--color-gray-400)]',
            'transition-all duration-[var(--transition-fast)]',
            'hover:border-[var(--border-hover)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-0 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--background-secondary)]',
            !resizable && 'resize-none',
            error && 'border-[var(--color-error)] focus:ring-[var(--color-error)]',
            'min-h-[120px]',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          {...props}
        />

        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${textareaId}-error`}
                className="text-sm text-[var(--color-error)]"
                role="alert"
              >
                {error}
              </p>
            )}
            {hint && !error && (
              <p
                id={`${textareaId}-hint`}
                className="text-sm text-[var(--color-gray-500)]"
              >
                {hint}
              </p>
            )}
          </div>

          {characterCount && maxLength && (
            <p className="text-sm text-[var(--color-gray-500)] ml-3 flex-shrink-0">
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
