/**
 * Loading - Unit Tests
 * Loading コンポーネントのテスト
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Loading } from '../ui/Loading';

describe('Loading', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      const { container } = render(<Loading />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('role="status"とaria-labelが設定される', () => {
      render(<Loading />);
      const loading = screen.getByRole('status');
      expect(loading).toBeInTheDocument();
      expect(loading).toHaveAttribute('aria-label', 'Loading');
    });

    it('スクリーンリーダー用テキストが含まれる', () => {
      render(<Loading />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('variant プロパティ', () => {
    it('spinner variant が正常にレンダリングされる', () => {
      const { container } = render(<Loading variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('dots variant が正常にレンダリングされる', () => {
      const { container } = render(<Loading variant="dots" />);
      const dots = container.querySelectorAll('[class*="rounded-full"]');
      expect(dots).toHaveLength(3);
    });

    it('pulse variant が正常にレンダリングされる', () => {
      const { container } = render(<Loading variant="pulse" />);
      const pulse = container.querySelector('[class*="rounded-full"]');
      expect(pulse).toBeInTheDocument();
    });
  });

  describe('size プロパティ', () => {
    it('size="sm" が適用される', () => {
      const { container } = render(<Loading size="sm" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('size="md" が適用される（デフォルト）', () => {
      const { container } = render(<Loading size="md" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-8', 'w-8');
    });

    it('size="lg" が適用される', () => {
      const { container } = render(<Loading size="lg" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-12', 'w-12');
    });
  });

  describe('color プロパティ', () => {
    it('color="primary" が適用される（デフォルト）', () => {
      const { container } = render(<Loading color="primary" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-[var(--color-primary)]');
    });

    it('color="secondary" が適用される', () => {
      const { container } = render(<Loading color="secondary" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-[var(--color-gray-600)]');
    });

    it('color="white" が適用される', () => {
      const { container } = render(<Loading color="white" variant="spinner" />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-white');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Loading className="custom-loading" />);
      const loading = container.firstChild as HTMLElement;
      expect(loading).toHaveClass('custom-loading');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Loading className="mt-4" />);
      const loading = container.firstChild as HTMLElement;
      expect(loading).toHaveClass('mt-4', 'inline-flex', 'items-center', 'justify-center');
    });
  });

  describe('組み合わせテスト', () => {
    it('全てのプロパティを組み合わせて使用できる', () => {
      const { container } = render(
        <Loading
          variant="dots"
          size="lg"
          color="secondary"
          className="custom-class"
        />
      );
      const loading = container.firstChild as HTMLElement;
      expect(loading).toBeInTheDocument();
      expect(loading).toHaveClass('custom-class');
    });

    it('spinner + lg + white の組み合わせ', () => {
      const { container } = render(
        <Loading variant="spinner" size="lg" color="white" />
      );
      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('h-12', 'w-12', 'text-white');
    });

    it('dots + sm + primary の組み合わせ', () => {
      const { container } = render(
        <Loading variant="dots" size="sm" color="primary" />
      );
      const dots = container.querySelectorAll('[class*="rounded-full"]');
      expect(dots).toHaveLength(3);
      expect(dots[0]).toHaveClass('h-1.5', 'w-1.5');
    });

    it('pulse + md + secondary の組み合わせ', () => {
      const { container } = render(
        <Loading variant="pulse" size="md" color="secondary" />
      );
      const pulse = container.querySelector('[class*="rounded-full"]');
      expect(pulse).toHaveClass('h-8', 'w-8');
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性が設定される', () => {
      render(<Loading />);
      const loading = screen.getByRole('status');
      expect(loading).toHaveAttribute('aria-label', 'Loading');
    });

    it('スクリーンリーダー用のテキストがsr-onlyクラスで隠される', () => {
      render(<Loading />);
      const srText = screen.getByText('Loading...');
      expect(srText).toHaveClass('sr-only');
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<Loading />)).not.toThrow();
    });

    it('複数のLoadingコンポーネントを同時にレンダリングできる', () => {
      const { container } = render(
        <>
          <Loading variant="spinner" />
          <Loading variant="dots" />
          <Loading variant="pulse" />
        </>
      );
      const loadings = container.querySelectorAll('[role="status"]');
      expect(loadings).toHaveLength(3);
    });

    it('異なるサイズのLoadingを同時にレンダリングできる', () => {
      const { container } = render(
        <>
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" />
        </>
      );
      const loadings = container.querySelectorAll('[role="status"]');
      expect(loadings).toHaveLength(3);
    });
  });
});
