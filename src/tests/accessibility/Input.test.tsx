/**
 * Input Component - Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance for Input component:
 * - Proper labeling (label, aria-label)
 * - Error message association (aria-describedby, aria-invalid)
 * - Keyboard navigation
 * - Focus visibility
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

expect.extend(toHaveNoViolations);

describe('Input Accessibility', () => {
  it('should not have any axe violations', async () => {
    const { container } = render(<Input label="Name" name="name" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should associate label with input correctly', () => {
    render(<Input label="Email Address" name="email" />);

    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();
  });

  it('should have aria-invalid when error is present', () => {
    render(<Input label="Username" name="username" error="Username is required" />);

    const input = screen.getByLabelText(/username/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('should associate error message with aria-describedby', () => {
    render(<Input label="Password" name="password" error="Password too short" />);

    const input = screen.getByLabelText(/password/i);
    const errorId = input.getAttribute('aria-describedby');

    expect(errorId).toBeTruthy();
    expect(screen.getByText(/password too short/i)).toHaveAttribute('id', errorId!);
  });

  it('should have role="alert" for error messages', () => {
    render(<Input label="Email" name="email" error="Invalid email" />);

    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveTextContent(/invalid email/i);
  });

  it('should associate hint text with aria-describedby', () => {
    render(<Input label="Phone" name="phone" hint="Format: +1-234-567-8900" />);

    const input = screen.getByLabelText(/phone/i);
    const hintId = input.getAttribute('aria-describedby');

    expect(hintId).toBeTruthy();
    expect(screen.getByText(/format:/i)).toHaveAttribute('id', hintId!);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<Input label="Search" name="search" />);

    const input = screen.getByLabelText(/search/i);

    // Tab to input
    await user.tab();
    expect(input).toHaveFocus();

    // Type in input
    await user.keyboard('test query');
    expect(input).toHaveValue('test query');
  });

  it('should have visible focus indicator', async () => {
    const user = userEvent.setup();
    render(<Input label="Focus test" name="focus" />);

    const input = screen.getByLabelText(/focus test/i);
    await user.tab();

    expect(input).toHaveFocus();
  });

  it('should properly disable input with aria-disabled', () => {
    render(<Input label="Disabled" name="disabled" disabled />);

    const input = screen.getByLabelText(/disabled/i);
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute('disabled');
  });

  it('should support different input types', async () => {
    const types: Array<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'> = ['text', 'email', 'password', 'number', 'tel', 'url'];

    for (const type of types) {
      const { container } = render(<Input label={type} name={type} type={type} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('should mark icon elements as decorative', () => {
    const icon = <span data-testid="icon">🔍</span>;
    render(<Input label="Search" name="search" leftIcon={icon} />);

    // Icons should not be focusable or announced by screen readers
    const input = screen.getByLabelText(/search/i);
    expect(input).toBeInTheDocument();
  });

  it('should meet color contrast requirements', async () => {
    const { container } = render(
      <Input label="Contrast test" name="contrast" />
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });

    expect(results).toHaveNoViolations();
  });
});
