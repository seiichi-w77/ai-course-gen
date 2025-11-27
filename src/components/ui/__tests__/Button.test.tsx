/**
 * Button - Unit Tests
 * Button コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from '../Button';

describe('Button', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
      render(<Button>Submit Form</Button>);
      expect(screen.getByText('Submit Form')).toBeInTheDocument();
    });

    it('type属性がデフォルトでbuttonになる', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('type="submit"が正しく適用される', () => {
      render(<Button type="submit">Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });
  });

  describe('variant プロパティ', () => {
    it('variant="primary"が適用される（デフォルト）', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-[var(--color-primary)]');
    });

    it('variant="secondary"が適用される', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-[var(--color-gray-100)]');
    });

    it('variant="outline"が適用される', () => {
      const { container } = render(<Button variant="outline">Outline</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('border', 'border-[var(--border)]', 'bg-transparent');
    });

    it('variant="ghost"が適用される', () => {
      const { container } = render(<Button variant="ghost">Ghost</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-transparent');
    });

    it('variant="danger"が適用される', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-[var(--color-error)]');
    });
  });

  describe('size プロパティ', () => {
    it('size="sm"が適用される', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('h-8', 'px-3', 'text-sm');
    });

    it('size="md"が適用される（デフォルト）', () => {
      const { container } = render(<Button size="md">Medium</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('h-10', 'px-4', 'text-base');
    });

    it('size="lg"が適用される', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('h-12', 'px-6', 'text-lg');
    });
  });

  describe('disabled状態', () => {
    it('disabled属性が適用される', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('aria-disabledが設定される', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('disabledスタイルが適用される', () => {
      const { container } = render(<Button disabled>Disabled</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('disabled時はクリックできない', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('loading状態', () => {
    it('isLoading=trueでローディングスピナーが表示される', () => {
      const { container } = render(<Button isLoading>Loading</Button>);
      const spinner = container.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('isLoading=trueで子要素が非表示になる', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('isLoading時はaria-busy="true"が設定される', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('isLoading時はdisabledになる', () => {
      render(<Button isLoading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('isLoading時はaria-label="Loading..."が設定される', () => {
      render(<Button isLoading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Loading...');
    });

    it('スクリーンリーダー用テキスト"Loading..."が含まれる', () => {
      render(<Button isLoading>Submit</Button>);
      expect(screen.getByText('Loading...')).toHaveClass('sr-only');
    });
  });

  describe('クリックイベント', () => {
    it('クリック時にonClickが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('複数回クリックできる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      await user.click(button);
      await user.click(button);
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it('Enterキーで操作できる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('Spaceキーで操作できる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');

      button.focus();
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('アイコン表示', () => {
    it('leftIconが表示される', () => {
      const LeftIcon = <span data-testid="left-icon">←</span>;
      render(<Button leftIcon={LeftIcon}>With Icon</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('rightIconが表示される', () => {
      const RightIcon = <span data-testid="right-icon">→</span>;
      render(<Button rightIcon={RightIcon}>With Icon</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('両方のアイコンが同時に表示される', () => {
      const LeftIcon = <span data-testid="left-icon">←</span>;
      const RightIcon = <span data-testid="right-icon">→</span>;
      render(
        <Button leftIcon={LeftIcon} rightIcon={RightIcon}>
          With Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('loading時はアイコンが非表示になる', () => {
      const LeftIcon = <span data-testid="left-icon">←</span>;
      const RightIcon = <span data-testid="right-icon">→</span>;
      render(
        <Button isLoading leftIcon={LeftIcon} rightIcon={RightIcon}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });

    it('アイコンにaria-hidden="true"が設定される', () => {
      const { container } = render(
        <Button leftIcon={<span>←</span>}>With Icon</Button>
      );
      const iconContainer = container.querySelector('span.flex-shrink-0');
      expect(iconContainer).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('アクセシビリティ', () => {
    it('aria-labelが正しく設定される', () => {
      render(<Button aria-label="Custom Label">Button</Button>);
      const button = screen.getByRole('button', { name: /custom label/i });
      expect(button).toBeInTheDocument();
    });

    it('aria-describedbyが正しく設定される', () => {
      render(<Button aria-describedby="description">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('フォーカス時にフォーカスリングが表示される', () => {
      const { container } = render(<Button>Focus me</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-[var(--color-primary)]');
    });

    it('role="button"が設定される', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Button className="custom-button">Custom</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-button');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Button className="mt-4">Custom</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('mt-4', 'inline-flex', 'items-center', 'justify-center');
    });
  });

  describe('組み合わせテスト', () => {
    it('variant + size + disabled の組み合わせ', () => {
      const { container } = render(
        <Button variant="secondary" size="lg" disabled>
          Disabled Large
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-[var(--color-gray-100)]', 'h-12', 'px-6');
      expect(button).toBeDisabled();
    });

    it('variant + size + loading の組み合わせ', () => {
      const { container } = render(
        <Button variant="primary" size="sm" isLoading>
          Loading Small
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-[var(--color-primary)]', 'h-8', 'px-3');
      const spinner = container.querySelector('svg.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('全てのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const LeftIcon = <span data-testid="left-icon">←</span>;

      render(
        <Button
          variant="outline"
          size="md"
          onClick={handleClick}
          leftIcon={LeftIcon}
          className="custom-class"
          aria-label="Complete Button"
        >
          Complete
        </Button>
      );

      const button = screen.getByRole('button', { name: /complete button/i });
      expect(button).toHaveClass('custom-class', 'border', 'border-[var(--border)]');
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();

      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('エッジケース', () => {
    it('子要素なしでもエラーにならない', () => {
      expect(() => render(<Button />)).not.toThrow();
    });

    it('空の文字列を渡してもエラーにならない', () => {
      expect(() => render(<Button>{''}</Button>)).not.toThrow();
    });

    it('複数のButtonを同時にレンダリングできる', () => {
      render(
        <>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('disabled=falseとisLoading=falseが正しく動作する', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      render(
        <Button disabled={false} isLoading={false} onClick={handleClick}>
          Active
        </Button>
      );
      const button = screen.getByRole('button');

      expect(button).not.toBeDisabled();
      await user.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('refを使ってプログラム的にフォーカスできる', () => {
      const ref = { current: null } as React.RefObject<HTMLButtonElement>;
      render(<Button ref={ref}>Button</Button>);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });
  });
});
