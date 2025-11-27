/**
 * Toast - Unit Tests
 * Toast コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Toast, ToastContainer } from '../Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('titleが表示される', () => {
      render(
        <Toast
          id="test-toast"
          type="info"
          title="Information"
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Information')).toBeInTheDocument();
    });

    it('descriptionが表示される', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          description="Operation completed successfully"
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    });

    it('descriptionなしでもエラーにならない', () => {
      expect(() =>
        render(
          <Toast
            id="test-toast"
            type="success"
            title="Success"
            onClose={() => {}}
          />
        )
      ).not.toThrow();
    });
  });

  describe('variant表示 (success, error, warning, info)', () => {
    it('type="success"が正しく表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('bg-[var(--color-success)]', 'text-white');
    });

    it('type="error"が正しく表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="error"
          title="Error"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('bg-[var(--color-error)]', 'text-white');
    });

    it('type="warning"が正しく表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="warning"
          title="Warning"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('bg-[var(--color-warning)]', 'text-white');
    });

    it('type="info"が正しく表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="info"
          title="Info"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveClass('bg-[var(--color-info)]', 'text-white');
    });

    it('success アイコンが表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('error アイコンが表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="error"
          title="Error"
          onClose={() => {}}
        />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('warning アイコンが表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="warning"
          title="Warning"
          onClose={() => {}}
        />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('info アイコンが表示される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="info"
          title="Info"
          onClose={() => {}}
        />
      );
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('自動消去', () => {
    it('デフォルトで5秒後にonCloseが呼ばれる', () => {
      const handleClose = vi.fn();
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={handleClose}
        />
      );

      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(5000);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledWith('test-toast');
    });

    it('カスタムdurationで自動消去される', () => {
      const handleClose = vi.fn();
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          duration={3000}
          onClose={handleClose}
        />
      );

      vi.advanceTimersByTime(2999);
      expect(handleClose).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('duration=0で自動消去されない', () => {
      const handleClose = vi.fn();
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          duration={0}
          onClose={handleClose}
        />
      );

      vi.advanceTimersByTime(10000);
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('duration負の値で自動消去されない', () => {
      const handleClose = vi.fn();
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          duration={-1}
          onClose={handleClose}
        />
      );

      vi.advanceTimersByTime(10000);
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('閉じるボタン', () => {
    it('閉じるボタンが表示される', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const closeButton = screen.getByRole('button', {
        name: /close notification: success/i,
      });
      expect(closeButton).toBeInTheDocument();
    });

    it('閉じるボタンクリックでonCloseが呼ばれる', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={handleClose}
          duration={0}
        />
      );

      const closeButton = screen.getByRole('button', {
        name: /close notification: success/i,
      });
      await user.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledWith('test-toast');
      vi.useFakeTimers(); // Restore fake timers
    });

    it('閉じるボタンにSVGアイコンが含まれる', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const closeButton = screen.getByRole('button', {
        name: /close notification/i,
      });
      const svg = closeButton.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('action プロパティ', () => {
    it('actionボタンが表示される', () => {
      const action = {
        label: 'Undo',
        onClick: vi.fn(),
      };
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          action={action}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Undo')).toBeInTheDocument();
    });

    it('actionボタンクリックでonClickとonCloseが呼ばれる', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const user = userEvent.setup();
      const handleActionClick = vi.fn();
      const handleClose = vi.fn();
      const action = {
        label: 'Undo',
        onClick: handleActionClick,
      };

      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          action={action}
          onClose={handleClose}
          duration={0}
        />
      );

      const actionButton = screen.getByRole('button', { name: /undo - success/i });
      await user.click(actionButton);

      expect(handleActionClick).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleClose).toHaveBeenCalledWith('test-toast');
      vi.useFakeTimers(); // Restore fake timers
    });

    it('actionなしでもエラーにならない', () => {
      expect(() =>
        render(
          <Toast
            id="test-toast"
            type="success"
            title="Success"
            onClose={() => {}}
          />
        )
      ).not.toThrow();
    });
  });

  describe('アクセシビリティ', () => {
    it('type="error"の時、role="alert"が設定される', () => {
      render(
        <Toast
          id="test-toast"
          type="error"
          title="Error"
          onClose={() => {}}
        />
      );
      const toast = screen.getByRole('alert');
      expect(toast).toBeInTheDocument();
    });

    it('type="error"の時、aria-live="assertive"が設定される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="error"
          title="Error"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'assertive');
    });

    it('type="success"の時、role="status"が設定される', () => {
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const toast = screen.getByRole('status');
      expect(toast).toBeInTheDocument();
    });

    it('type="success"の時、aria-live="polite"が設定される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });

    it('aria-atomic="true"が設定される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="info"
          title="Info"
          onClose={() => {}}
        />
      );
      const toast = container.firstChild as HTMLElement;
      expect(toast).toHaveAttribute('aria-atomic', 'true');
    });

    it('アイコンにaria-hidden="true"が設定される', () => {
      const { container } = render(
        <Toast
          id="test-toast"
          type="success"
          title="Success"
          onClose={() => {}}
        />
      );
      const iconContainer = container.querySelector('[aria-hidden="true"]');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('空のtitleでもエラーにならない', () => {
      expect(() =>
        render(
          <Toast id="test-toast" type="success" title="" onClose={() => {}} />
        )
      ).not.toThrow();
    });

    it('非常に長いtitleを処理できる', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <Toast
          id="test-toast"
          type="success"
          title={longTitle}
          onClose={() => {}}
        />
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('非常に長いdescriptionを処理できる', () => {
      const longDescription = 'B'.repeat(500);
      render(
        <Toast
          id="test-toast"
          type="success"
          title="Title"
          description={longDescription}
          onClose={() => {}}
        />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });
});

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      const toasts = [
        {
          id: '1',
          type: 'success' as const,
          title: 'Success',
          onClose: () => {},
        },
      ];
      render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('空の配列でもエラーにならない', () => {
      expect(() =>
        render(<ToastContainer toasts={[]} onRemove={() => {}} />)
      ).not.toThrow();
    });

    it('複数のToastを表示できる', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast 1', onClose: () => {} },
        { id: '2', type: 'error' as const, title: 'Toast 2', onClose: () => {} },
        { id: '3', type: 'info' as const, title: 'Toast 3', onClose: () => {} },
      ];
      render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
      expect(screen.getByText('Toast 1')).toBeInTheDocument();
      expect(screen.getByText('Toast 2')).toBeInTheDocument();
      expect(screen.getByText('Toast 3')).toBeInTheDocument();
    });
  });

  describe('position プロパティ', () => {
    it('position="top-right"が適用される（デフォルト）', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} position="top-right" />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveClass('top-6', 'right-6');
    });

    it('position="top-left"が適用される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} position="top-left" />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveClass('top-6', 'left-6');
    });

    it('position="bottom-right"が適用される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} position="bottom-right" />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveClass('bottom-6', 'right-6');
    });

    it('position="bottom-left"が適用される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} position="bottom-left" />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveClass('bottom-6', 'left-6');
    });
  });

  describe('アクセシビリティ', () => {
    it('role="region"が設定される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
      const container = screen.getByRole('region');
      expect(container).toBeInTheDocument();
    });

    it('aria-label="Notifications"が設定される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      render(<ToastContainer toasts={toasts} onRemove={() => {}} />);
      const container = screen.getByRole('region');
      expect(container).toHaveAttribute('aria-label', 'Notifications');
    });

    it('aria-live="polite"が設定される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveAttribute('aria-live', 'polite');
    });

    it('aria-relevant="additions removals"が設定される', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Toast', onClose: () => {} },
      ];
      const { container } = render(
        <ToastContainer toasts={toasts} onRemove={() => {}} />
      );
      const toastContainer = container.firstChild as HTMLElement;
      expect(toastContainer).toHaveAttribute('aria-relevant', 'additions removals');
    });
  });

  describe('Toast削除', () => {
    it('onRemoveが正しく呼ばれる', async () => {
      vi.useRealTimers(); // Use real timers for this test
      const user = userEvent.setup();
      const handleRemove = vi.fn();
      const toasts = [
        { id: 'toast-1', type: 'success' as const, title: 'Toast', onClose: handleRemove, duration: 0 },
      ];

      render(<ToastContainer toasts={toasts} onRemove={handleRemove} />);

      const closeButton = screen.getByRole('button', { name: /close notification/i });
      await user.click(closeButton);

      expect(handleRemove).toHaveBeenCalledWith('toast-1');
      vi.useFakeTimers(); // Restore fake timers
    });
  });

  describe('組み合わせテスト', () => {
    it('異なるtypeのToastを同時に表示できる', () => {
      const toasts = [
        { id: '1', type: 'success' as const, title: 'Success', onClose: () => {} },
        { id: '2', type: 'error' as const, title: 'Error', onClose: () => {} },
        { id: '3', type: 'warning' as const, title: 'Warning', onClose: () => {} },
        { id: '4', type: 'info' as const, title: 'Info', onClose: () => {} },
      ];
      render(<ToastContainer toasts={toasts} onRemove={() => {}} />);

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
    });
  });
});
