/**
 * Input - Unit Tests
 * Input コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '../Input';

describe('Input', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('type属性がデフォルトでtextになる', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('異なるtype属性が正しく適用される', () => {
      const { container } = render(<Input type="email" />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('type="password"が正しく適用される', () => {
      const { container } = render(<Input type="password" />);
      const input = container.querySelector('input');
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('label プロパティ', () => {
    it('labelが表示される', () => {
      render(<Input label="Username" />);
      expect(screen.getByText('Username')).toBeInTheDocument();
    });

    it('labelとinputが正しく関連付けられる', () => {
      render(<Input label="Email" id="email-input" />);
      const label = screen.getByText('Email');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'email-input');
      expect(input).toHaveAttribute('id', 'email-input');
    });

    it('labelなしでもエラーにならない', () => {
      expect(() => render(<Input />)).not.toThrow();
    });

    it('name属性があればidとして使用される', () => {
      render(<Input name="username" label="Username" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'username');
    });
  });

  describe('value変更', () => {
    it('値を入力できる', async () => {
      const user = userEvent.setup();
      render(<Input />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'Hello World');
      expect(input).toHaveValue('Hello World');
    });

    it('onChange が呼ばれる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
    });

    it('制御されたコンポーネントとして動作する', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-input"
          />
        );
      };

      render(<TestComponent />);
      const input = screen.getByTestId('controlled-input');

      await user.type(input, 'controlled');
      expect(input).toHaveValue('controlled');
    });

    it('defaultValueが正しく設定される', () => {
      render(<Input defaultValue="Default text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default text');
    });
  });

  describe('error状態', () => {
    it('エラーメッセージが表示される', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid="true"が設定される', () => {
      render(<Input error="Invalid input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーなし時はaria-invalid="false"が設定される', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'false');
    });

    it('エラーメッセージにrole="alert"が設定される', () => {
      render(<Input error="Error message" id="test-input" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error message');
    });

    it('エラー時はaria-describedbyが設定される', () => {
      render(<Input error="Error message" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    });

    it('エラースタイルが適用される', () => {
      const { container } = render(<Input error="Error" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('border-[var(--color-error)]', 'focus:ring-[var(--color-error)]');
    });

    it('エラーがあるときhintは表示されない', () => {
      render(<Input error="Error message" hint="Hint text" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
    });
  });

  describe('disabled状態', () => {
    it('disabled属性が適用される', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('disabled時は入力できない', async () => {
      const user = userEvent.setup();
      render(<Input disabled />);
      const input = screen.getByRole('textbox');

      await user.type(input, 'test');
      expect(input).toHaveValue('');
    });

    it('disabledスタイルが適用される', () => {
      const { container } = render(<Input disabled />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('placeholder表示', () => {
    it('placeholderが表示される', () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('placeholderスタイルが適用される', () => {
      const { container } = render(<Input placeholder="Placeholder text" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('placeholder:text-[var(--color-gray-400)]');
    });
  });

  describe('hint プロパティ', () => {
    it('hintテキストが表示される', () => {
      render(<Input hint="Enter at least 8 characters" id="password" />);
      expect(screen.getByText('Enter at least 8 characters')).toBeInTheDocument();
    });

    it('hint時はaria-describedbyが設定される', () => {
      render(<Input hint="Hint text" id="test-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'test-input-hint');
    });

    it('hintスタイルが適用される', () => {
      render(<Input hint="Hint text" id="test" />);
      const hint = screen.getByText('Hint text');
      expect(hint).toHaveClass('text-sm', 'text-[var(--color-gray-500)]');
    });
  });

  describe('icon プロパティ', () => {
    it('leftIconが表示される', () => {
      const LeftIcon = <span data-testid="left-icon">@</span>;
      render(<Input leftIcon={LeftIcon} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('rightIconが表示される', () => {
      const RightIcon = <span data-testid="right-icon">✓</span>;
      render(<Input rightIcon={RightIcon} />);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('leftIcon時は左パディングが調整される', () => {
      const { container } = render(<Input leftIcon={<span>@</span>} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('pl-10');
    });

    it('rightIcon時は右パディングが調整される', () => {
      const { container } = render(<Input rightIcon={<span>✓</span>} />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('pr-10');
    });

    it('両方のアイコンが同時に表示される', () => {
      const LeftIcon = <span data-testid="left-icon">@</span>;
      const RightIcon = <span data-testid="right-icon">✓</span>;
      render(<Input leftIcon={LeftIcon} rightIcon={RightIcon} />);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('role="textbox"が設定される', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('フォーカス時にフォーカスリングが表示される', () => {
      const { container } = render(<Input />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-[var(--color-primary)]');
    });

    it('適切なARIA属性が設定される', () => {
      render(
        <Input
          id="accessible-input"
          label="Accessible Input"
          error="Error message"
        />
      );
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', 'accessible-input-error');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Input className="custom-input" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('custom-input');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Input className="mt-4" />);
      const input = container.querySelector('input');
      expect(input).toHaveClass('mt-4', 'w-full', 'h-10', 'px-4');
    });
  });

  describe('組み合わせテスト', () => {
    it('label + error + hint の組み合わせ', () => {
      render(
        <Input
          label="Email"
          error="Invalid email"
          hint="This hint should not show"
          id="email"
        />
      );
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
      expect(screen.queryByText('This hint should not show')).not.toBeInTheDocument();
    });

    it('全てのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      const LeftIcon = <span data-testid="left-icon">@</span>;

      render(
        <Input
          label="Username"
          placeholder="Enter username"
          hint="At least 3 characters"
          leftIcon={LeftIcon}
          onChange={handleChange}
          className="custom-class"
          id="username"
        />
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
      expect(screen.getByText('At least 3 characters')).toBeInTheDocument();
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<Input />)).not.toThrow();
    });

    it('空の文字列をlabelに渡してもエラーにならない', () => {
      expect(() => render(<Input label="" />)).not.toThrow();
    });

    it('複数のInputを同時にレンダリングできる', () => {
      render(
        <>
          <Input placeholder="Input 1" />
          <Input placeholder="Input 2" />
          <Input placeholder="Input 3" />
        </>
      );
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(3);
    });

    it('value=""の空文字列を処理できる', () => {
      render(<Input value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('refを使ってプログラム的にフォーカスできる', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<Input ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });

    it('refを使って値を取得できる', () => {
      const ref = { current: null } as React.RefObject<HTMLInputElement>;
      render(<Input ref={ref} defaultValue="test value" />);
      expect(ref.current?.value).toBe('test value');
    });
  });

  describe('その他のHTML属性', () => {
    it('maxLength属性が適用される', () => {
      render(<Input maxLength={10} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '10');
    });

    it('required属性が適用される', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('name属性が適用される', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('autoComplete属性が適用される', () => {
      render(<Input autoComplete="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autoComplete', 'email');
    });
  });
});
