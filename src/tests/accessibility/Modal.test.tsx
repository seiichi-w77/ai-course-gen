/**
 * Modal Component - Accessibility Tests
 *
 * Tests WCAG 2.1 AA compliance for Modal component:
 * - role="dialog" and aria-modal
 * - Focus trap (Tab navigation stays within modal)
 * - Focus restoration (returns focus to trigger element)
 * - Keyboard escape (Esc key closes modal)
 * - Proper labeling (aria-labelledby, aria-describedby)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

expect.extend(toHaveNoViolations);

describe('Modal Accessibility', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Cleanup
    document.body.style.overflow = 'unset';
  });

  it('should not have any axe violations when open', async () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have role="dialog" and aria-modal="true"', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Dialog">
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('should be labeled by title with aria-labelledby', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Important Dialog">
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog', { name: /important dialog/i });
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('should be described by description with aria-describedby', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Confirm Action"
        description="This action cannot be undone"
      >
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    expect(screen.getByText(/this action cannot be undone/i)).toHaveAttribute(
      'id',
      'modal-description'
    );
  });

  it('should trap focus within modal', async () => {
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={() => {}} title="Focus Trap Test">
        <button>First Button</button>
        <button>Second Button</button>
        <input placeholder="Input" />
      </Modal>
    );

    // Wait for auto-focus
    await waitFor(() => {
      expect(document.activeElement).toBeTruthy();
    });

    // Tab through elements
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();

    // After last element, should wrap to first
    await user.tab();

    // Focus should stay within modal
    const focusedElement = document.activeElement;
    const modalContent = screen.getByRole('dialog');
    expect(modalContent.contains(focusedElement)).toBe(true);
  });

  it('should close on Escape key press', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Test">
        Content
      </Modal>
    );

    await user.keyboard('{Escape}');
    expect(handleClose).toHaveBeenCalled();
  });

  it('should restore focus to trigger element after closing', async () => {
    const user = userEvent.setup();
    const TestComponent = () => {
      const [isOpen, setIsOpen] = React.useState(false);

      return (
        <>
          <button onClick={() => setIsOpen(true)}>Open Modal</button>
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test">
            <button onClick={() => setIsOpen(false)}>Close</button>
          </Modal>
        </>
      );
    };

    render(<TestComponent />);

    const openButton = screen.getByText(/open modal/i);
    await user.click(openButton);

    // Modal is open
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close modal
    const closeButton = screen.getByText(/close/i);
    await user.click(closeButton);

    // Focus should return to open button
    await waitFor(() => {
      expect(openButton).toHaveFocus();
    });
  });

  it('should focus first interactive element on open', async () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Auto Focus">
        <button>First Interactive</button>
        <button>Second Interactive</button>
      </Modal>
    );

    await waitFor(() => {
      const firstButton = screen.getByText(/first interactive/i);
      expect(firstButton).toHaveFocus();
    }, { timeout: 500 });
  });

  it('should have accessible close button', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Close Button Test">
        Content
      </Modal>
    );

    const closeButton = screen.getByLabelText(/close modal/i);
    expect(closeButton).toHaveAttribute('type', 'button');
    expect(closeButton).toBeInTheDocument();
  });

  it('should mark backdrop as decorative with aria-hidden', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Backdrop Test">
        Content
      </Modal>
    );

    // Backdrop should be aria-hidden
    const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50');
    expect(backdrop).toHaveAttribute('aria-hidden', 'true');
  });

  it('should prevent body scroll when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Scroll Lock">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should restore body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} title="Scroll Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Modal isOpen={false} onClose={() => {}} title="Scroll Test">
        Content
      </Modal>
    );

    expect(document.body.style.overflow).toBe('unset');
  });
});
