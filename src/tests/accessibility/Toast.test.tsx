/**
 * Toast Component - Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance for Toast component:
 * - role="alert" for error toasts, role="status" for others
 * - aria-live="assertive" for errors, "polite" for others
 * - aria-atomic for complete announcements
 * - Proper labeling and descriptions
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { Toast, ToastContainer, type ToastType } from '@/components/ui/Toast';

expect.extend(toHaveNoViolations);

describe('Toast Accessibility', () => {
  it('should not have any axe violations', async () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-toast"
        type="success"
        title="Success message"
        onClose={handleClose}
      />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should use role="alert" for error toasts', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="error-toast"
        type="error"
        title="Error occurred"
        onClose={handleClose}
      />
    );

    const toast = screen.getByRole('alert');
    expect(toast).toHaveTextContent(/error occurred/i);
  });

  it('should use role="status" for non-error toasts', () => {
    const handleClose = vi.fn();
    const types: ToastType[] = ['success', 'warning', 'info'];

    types.forEach((type) => {
      render(
        <Toast
          id={`${type}-toast`}
          type={type}
          title={`${type} message`}
          onClose={handleClose}
        />
      );

      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });
  });

  it('should use aria-live="assertive" for error toasts', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast
        id="error-toast"
        type="error"
        title="Critical error"
        onClose={handleClose}
      />
    );

    const toast = container.querySelector('[aria-live="assertive"]');
    expect(toast).toBeInTheDocument();
  });

  it('should use aria-live="polite" for non-error toasts', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast
        id="success-toast"
        type="success"
        title="Success"
        onClose={handleClose}
      />
    );

    const toast = container.querySelector('[aria-live="polite"]');
    expect(toast).toBeInTheDocument();
  });

  it('should have aria-atomic="true"', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-toast"
        type="info"
        title="Information"
        onClose={handleClose}
      />
    );

    const toast = container.querySelector('[aria-atomic="true"]');
    expect(toast).toBeInTheDocument();
  });

  it('should have accessible close button', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="test-toast"
        type="success"
        title="Test message"
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText(/close notification: test message/i);
    expect(closeButton).toHaveAttribute('type', 'button');
  });

  it('should mark icons as decorative with aria-hidden', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-toast"
        type="success"
        title="Success"
        onClose={handleClose}
      />
    );

    // Icon container should be aria-hidden
    const icon = container.querySelector('[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });

  it('should close when close button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Toast
        id="test-toast"
        type="info"
        title="Closeable toast"
        onClose={handleClose}
      />
    );

    const closeButton = screen.getByLabelText(/close notification/i);
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledWith('test-toast');
  });

  it('should auto-close after duration', async () => {
    const handleClose = vi.fn();

    render(
      <Toast
        id="test-toast"
        type="success"
        title="Auto-close"
        duration={100}
        onClose={handleClose}
      />
    );

    await waitFor(
      () => {
        expect(handleClose).toHaveBeenCalledWith('test-toast');
      },
      { timeout: 500 }
    );
  });

  it('should have accessible action button when provided', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const handleAction = vi.fn();

    render(
      <Toast
        id="test-toast"
        type="info"
        title="Action toast"
        onClose={handleClose}
        action={{
          label: 'Undo',
          onClick: handleAction,
        }}
      />
    );

    const actionButton = screen.getByRole('button', { name: /undo/i });
    expect(actionButton).toHaveAttribute('type', 'button');

    await user.click(actionButton);
    expect(handleAction).toHaveBeenCalled();
    expect(handleClose).toHaveBeenCalled();
  });

  it('should include description in accessibility tree', () => {
    const handleClose = vi.fn();
    render(
      <Toast
        id="test-toast"
        type="warning"
        title="Warning"
        description="This is a detailed warning message"
        onClose={handleClose}
      />
    );

    expect(screen.getByText(/this is a detailed warning message/i)).toBeInTheDocument();
  });
});

describe('ToastContainer Accessibility', () => {
  it('should have role="region" with aria-label', () => {
    render(
      <ToastContainer
        toasts={[]}
        onRemove={() => {}}
      />
    );

    const region = screen.getByRole('region', { name: /notifications/i });
    expect(region).toBeInTheDocument();
  });

  it('should have aria-live="polite" for container', () => {
    const { container } = render(
      <ToastContainer
        toasts={[]}
        onRemove={() => {}}
      />
    );

    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('should announce additions and removals', () => {
    const { container } = render(
      <ToastContainer
        toasts={[]}
        onRemove={() => {}}
      />
    );

    const region = container.querySelector('[aria-relevant="additions removals"]');
    expect(region).toBeInTheDocument();
  });

  it('should meet color contrast requirements for all toast types', async () => {
    const handleClose = vi.fn();
    const types: ToastType[] = ['success', 'error', 'warning', 'info'];

    for (const type of types) {
      const { container } = render(
        <Toast
          id={`${type}-toast`}
          type={type}
          title={`${type} message`}
          onClose={handleClose}
        />
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true },
        },
      });

      expect(results).toHaveNoViolations();
    }
  });
});
