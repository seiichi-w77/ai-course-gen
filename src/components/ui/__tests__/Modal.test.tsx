/**
 * Modal - Unit Tests
 * Modal コンポーネントのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Modal } from '../Modal';

describe('Modal', () => {
  // cleanup overflow style after each test
  afterEach(() => {
    document.body.style.overflow = 'unset';
  });

  describe('レンダリング', () => {
    it('isOpen=trueで正常にレンダリングされる', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Modal content
        </Modal>
      );
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('isOpen=falseで非表示になる', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          Modal content
        </Modal>
      );
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <div>Child 1</div>
          <div>Child 2</div>
        </Modal>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('開閉状態', () => {
    it('isOpenがtrueの時、モーダルが表示される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Open Modal
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('isOpenがfalseの時、モーダルが非表示になる', () => {
      render(
        <Modal isOpen={false} onClose={() => {}}>
          Closed Modal
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('isOpenがtrueに変わるとモーダルが表示される', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}}>
          Toggle Modal
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={() => {}}>
          Toggle Modal
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('onClose呼び出し', () => {
    it('閉じるボタンクリックでonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal content
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('バックドロップクリックでonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal content
        </Modal>
      );

      const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/50');
      if (backdrop) {
        await user.click(backdrop);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('モーダルコンテンツクリックではonCloseが呼ばれない', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div data-testid="modal-content">Modal content</div>
        </Modal>
      );

      const content = screen.getByTestId('modal-content');
      await user.click(content);
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Escapeキーで閉じる', () => {
    it('Escapeキー押下でonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal content
        </Modal>
      );

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('Escapeキー以外のキーではonCloseが呼ばれない', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          Modal content
        </Modal>
      );

      await user.keyboard('{Enter}');
      await user.keyboard('{Space}');
      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('title プロパティ', () => {
    it('titleが表示される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      );
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('titleがh2要素としてレンダリングされる', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      );
      const title = screen.getByText('Modal Title');
      expect(title.tagName).toBe('H2');
    });

    it('titleがある時、aria-labelledbyが設定される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Title">
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
    });

    it('titleがない時、aria-labelledbyは設定されない', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('description プロパティ', () => {
    it('descriptionが表示される', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          description="Modal description text"
        >
          Content
        </Modal>
      );
      expect(screen.getByText('Modal description text')).toBeInTheDocument();
    });

    it('descriptionがある時、aria-describedbyが設定される', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          description="Description"
        >
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });

    it('titleとdescriptionが同時に表示される', () => {
      render(
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Title"
          description="Description"
        >
          Content
        </Modal>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('size プロパティ', () => {
    it('size="sm"が適用される', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} size="sm">
          Small Modal
        </Modal>
      );
      const modalContent = container.querySelector('.max-w-sm');
      expect(modalContent).toBeInTheDocument();
    });

    it('size="md"が適用される（デフォルト）', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} size="md">
          Medium Modal
        </Modal>
      );
      const modalContent = container.querySelector('.max-w-md');
      expect(modalContent).toBeInTheDocument();
    });

    it('size="lg"が適用される', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} size="lg">
          Large Modal
        </Modal>
      );
      const modalContent = container.querySelector('.max-w-lg');
      expect(modalContent).toBeInTheDocument();
    });

    it('size="xl"が適用される', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} size="xl">
          Extra Large Modal
        </Modal>
      );
      const modalContent = container.querySelector('.max-w-xl');
      expect(modalContent).toBeInTheDocument();
    });
  });

  describe('closeButton プロパティ', () => {
    it('closeButton=trueで閉じるボタンが表示される（デフォルト）', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} closeButton={true}>
          Content
        </Modal>
      );
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('closeButton=falseで閉じるボタンが非表示になる', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} closeButton={false}>
          Content
        </Modal>
      );
      const closeButton = screen.queryByRole('button', { name: /close modal/i });
      expect(closeButton).not.toBeInTheDocument();
    });

    it('closeButton=falseでもEscapeキーで閉じられる', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} closeButton={false}>
          Content
        </Modal>
      );

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('role="dialog"が設定される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal="true"が設定される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('バックドロップにaria-hidden="true"が設定される', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      const backdrop = container.querySelector('[aria-hidden="true"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('閉じるボタンにaria-labelが設定される', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('フォーカス管理', () => {
    it('モーダルが開いた時、フォーカスが移動する', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          <button>First button</button>
          <button>Second button</button>
        </Modal>
      );

      await waitFor(() => {
        const firstButton = screen.getByText('First button');
        // Check that one of the focusable elements is focused
        const focusedElement = document.activeElement;
        const buttons = [
          firstButton,
          screen.getByText('Second button'),
          screen.getByRole('button', { name: /close modal/i }),
        ];
        expect(buttons.some(btn => btn === focusedElement)).toBe(true);
      }, { timeout: 500 });
    });

    it('閉じるボタンがある場合、フォーカス可能', async () => {
      render(
        <Modal isOpen={true} onClose={() => {}} closeButton={true}>
          Content without focusable elements
        </Modal>
      );

      await waitFor(() => {
        const closeButton = screen.getByRole('button', { name: /close modal/i });
        // The close button should exist and be focusable
        expect(closeButton).toBeInTheDocument();
        expect(closeButton).toBeVisible();
      }, { timeout: 500 });
    });
  });

  describe('body overflow 制御', () => {
    it('モーダルが開いた時、body overflow が hidden になる', () => {
      render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('モーダルが閉じた時、body overflow が unset になる', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={() => {}}>
          Content
        </Modal>
      );
      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} className="custom-modal">
          Content
        </Modal>
      );
      const modalContent = container.querySelector('.custom-modal');
      expect(modalContent).toBeInTheDocument();
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => {}} className="mt-4">
          Content
        </Modal>
      );
      const modalContent = container.querySelector('.mt-4');
      expect(modalContent).toBeInTheDocument();
      expect(modalContent).toHaveClass('rounded-[var(--radius-lg)]', 'mt-4');
    });
  });

  describe('組み合わせテスト', () => {
    it('全てのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleClose = vi.fn();

      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Complete Modal"
          description="This is a complete modal test"
          size="lg"
          closeButton={true}
          className="custom-class"
        >
          <p>Modal content here</p>
        </Modal>
      );

      expect(screen.getByText('Complete Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a complete modal test')).toBeInTheDocument();
      expect(screen.getByText('Modal content here')).toBeInTheDocument();

      const closeButton = screen.getByRole('button', { name: /close modal/i });
      await user.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('複数のモーダルを順次表示できる', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={() => {}} title="Modal 1">
          Content 1
        </Modal>
      );
      expect(screen.getByText('Modal 1')).toBeInTheDocument();

      rerender(
        <Modal isOpen={false} onClose={() => {}} title="Modal 1">
          Content 1
        </Modal>
      );
      expect(screen.queryByText('Modal 1')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={() => {}} title="Modal 2">
          Content 2
        </Modal>
      );
      expect(screen.getByText('Modal 2')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('子要素なしでもエラーにならない', () => {
      expect(() =>
        render(<Modal isOpen={true} onClose={() => {}} />)
      ).not.toThrow();
    });

    it('onCloseがundefinedでもレンダリングされる（警告は出る可能性あり）', () => {
      expect(() =>
        render(
          <Modal isOpen={true} onClose={undefined as any}>
            Content
          </Modal>
        )
      ).not.toThrow();
    });

    it('モーダル内にフォーカス可能な要素がない場合でもエラーにならない', () => {
      expect(() =>
        render(
          <Modal isOpen={true} onClose={() => {}} closeButton={false}>
            <p>Static content only</p>
          </Modal>
        )
      ).not.toThrow();
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(
        <Modal isOpen={true} onClose={() => {}} ref={ref}>
          Content
        </Modal>
      );
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});
