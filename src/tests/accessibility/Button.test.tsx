/**
 * Button Component - Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance for Button component:
 * - Color contrast ratios (4.5:1 minimum)
 * - Keyboard navigation (Tab, Enter, Space)
 * - ARIA attributes (aria-label, aria-disabled, aria-busy)
 * - Focus visibility
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should not have any axe violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA attributes when disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button', { name: /disabled button/i });

    expect(button).toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have proper ARIA attributes when loading', () => {
    render(<Button isLoading>Loading Button</Button>);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have custom aria-label when provided', () => {
    render(<Button aria-label="Custom label">Icon only</Button>);
    const button = screen.getByRole('button', { name: /custom label/i });

    expect(button).toBeInTheDocument();
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Clickable</Button>);
    const button = screen.getByRole('button', { name: /clickable/i });

    // Tab to button
    await user.tab();
    expect(button).toHaveFocus();

    // Press Enter
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Press Space
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should have visible focus indicator', async () => {
    const user = userEvent.setup();
    render(<Button>Focus me</Button>);
    const button = screen.getByRole('button', { name: /focus me/i });

    await user.tab();
    expect(button).toHaveFocus();

    // Check for focus-visible class or outline
    const styles = window.getComputedStyle(button);
    expect(styles.outline).not.toBe('none');
  });

  it('should have proper button type attribute', () => {
    const { rerender } = render(<Button>Default</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');

    rerender(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('should mark icons as decorative with aria-hidden', () => {
    const icon = <span data-testid="icon">🔥</span>;
    render(<Button leftIcon={icon}>With Icon</Button>);

    const iconElement = screen.getByTestId('icon').parentElement;
    expect(iconElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('should provide screen reader feedback when loading', () => {
    render(<Button isLoading>Loading</Button>);

    // Should have loading text for screen readers
    expect(screen.getByText(/loading/i, { selector: '.sr-only' })).toBeInTheDocument();
  });

  it('should meet color contrast requirements for all variants', async () => {
    const variants: Array<'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'> = [
      'primary',
      'secondary',
      'outline',
      'ghost',
      'danger',
    ];

    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>{variant}</Button>);
      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });
      expect(results).toHaveNoViolations();
    }
  });
});
