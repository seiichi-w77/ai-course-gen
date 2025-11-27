/**
 * Textarea - Unit Tests
 * Textarea コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Textarea } from '../Textarea';

describe('Textarea', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('textarea要素としてレンダリングされる', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('label プロパティ', () => {
    it('labelが表示される', () => {
      render(<Textarea label="Description" />);
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('labelとtextareaが正しく関連付けられる', () => {
      render(<Textarea label="Bio" id="bio-textarea" />);
      const label = screen.getByText('Bio');
      const textarea = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'bio-textarea');
      expect(textarea).toHaveAttribute('id', 'bio-textarea');
    });

    it('labelなしでもエラーにならない', () => {
      expect(() => render(<Textarea />)).not.toThrow();
    });

    it('name属性があればidとして使用される', () => {
      render(<Textarea name="bio" label="Bio" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('id', 'bio');
    });
  });

  describe('値変更', () => {
    it('値を入力できる', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Hello World');
      expect(textarea).toHaveValue('Hello World');
    });

    it('複数行の値を入力できる', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');
      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });

    it('onChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');
      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
    });

    it('制御されたコンポーネントとして動作する', async () => {
      const user = userEvent.setup();
      const { useState } = await import('react');

      const TestComponent = () => {
        const [value, setValue] = useState('');
        return (
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="controlled-textarea"
          />
        );
      };

      render(<TestComponent />);
      const textarea = screen.getByTestId('controlled-textarea');

      await user.type(textarea, 'controlled');
      expect(textarea).toHaveValue('controlled');
    });

    it('defaultValueが正しく設定される', () => {
      render(<Textarea defaultValue="Default text" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('Default text');
    });
  });

  describe('error状態', () => {
    it('エラーメッセージが表示される', () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid="true"が設定される', () => {
      render(<Textarea error="Invalid input" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーなし時はaria-invalid="false"が設定される', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'false');
    });

    it('エラーメッセージにrole="alert"が設定される', () => {
      render(<Textarea error="Error message" id="test-textarea" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error message');
    });

    it('エラー時はaria-describedbyが設定される', () => {
      render(<Textarea error="Error message" id="test-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-error');
    });

    it('エラースタイルが適用される', () => {
      const { container } = render(<Textarea error="Error" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('border-[var(--color-error)]', 'focus:ring-[var(--color-error)]');
    });

    it('エラーがあるときhintは表示されない', () => {
      render(<Textarea error="Error message" hint="Hint text" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
    });
  });

  describe('disabled状態', () => {
    it('disabled属性が適用される', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('disabled時は入力できない', async () => {
      const user = userEvent.setup();
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'test');
      expect(textarea).toHaveValue('');
    });

    it('disabledスタイルが適用される', () => {
      const { container } = render(<Textarea disabled />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('hint プロパティ', () => {
    it('hintテキストが表示される', () => {
      render(<Textarea hint="Enter your description" id="desc" />);
      expect(screen.getByText('Enter your description')).toBeInTheDocument();
    });

    it('hint時はaria-describedbyが設定される', () => {
      render(<Textarea hint="Hint text" id="test-textarea" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'test-textarea-hint');
    });

    it('hintスタイルが適用される', () => {
      render(<Textarea hint="Hint text" id="test" />);
      const hint = screen.getByText('Hint text');
      expect(hint).toHaveClass('text-sm', 'text-[var(--color-gray-500)]');
    });
  });

  describe('resizable プロパティ', () => {
    it('resizable=trueでリサイズ可能（デフォルト）', () => {
      const { container } = render(<Textarea resizable={true} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toHaveClass('resize-none');
    });

    it('resizable=falseでリサイズ不可', () => {
      const { container } = render(<Textarea resizable={false} />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('resize-none');
    });

    it('デフォルトでresizable=true', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).not.toHaveClass('resize-none');
    });
  });

  describe('characterCount プロパティ', () => {
    it('characterCount=trueで文字数カウンターが表示される', () => {
      render(<Textarea characterCount maxLength={100} value="" onChange={() => {}} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    it('characterCount=falseで文字数カウンターが非表示', () => {
      render(<Textarea characterCount={false} maxLength={100} value="" onChange={() => {}} />);
      expect(screen.queryByText('0/100')).not.toBeInTheDocument();
    });

    it('文字数カウンターが入力に応じて更新される', () => {
      render(<Textarea characterCount maxLength={100} value="Hello" onChange={() => {}} />);
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('maxLengthなしでcharacterCountを有効にしても表示されない', () => {
      const { container } = render(<Textarea characterCount value="test" onChange={() => {}} />);
      expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
    });

    it('characterCount + maxLength の組み合わせで正しく動作する', () => {
      render(<Textarea characterCount maxLength={50} value="Test" onChange={() => {}} />);
      expect(screen.getByText('4/50')).toBeInTheDocument();
    });
  });

  describe('maxLength プロパティ', () => {
    it('maxLength属性が適用される', () => {
      render(<Textarea maxLength={200} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxLength', '200');
    });

    it('maxLengthを超えて入力できない', async () => {
      const user = userEvent.setup();
      render(<Textarea maxLength={5} />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '12345678');
      expect(textarea).toHaveValue('12345');
    });
  });

  describe('placeholder プロパティ', () => {
    it('placeholderが表示される', () => {
      render(<Textarea placeholder="Enter your message" />);
      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
    });

    it('placeholderスタイルが適用される', () => {
      const { container } = render(<Textarea placeholder="Placeholder text" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('placeholder:text-[var(--color-gray-400)]');
    });
  });

  describe('アクセシビリティ', () => {
    it('role="textbox"が設定される', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('フォーカス時にフォーカスリングが表示される', () => {
      const { container } = render(<Textarea />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-[var(--color-primary)]');
    });

    it('適切なARIA属性が設定される', () => {
      render(
        <Textarea
          id="accessible-textarea"
          label="Accessible Textarea"
          error="Error message"
        />
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
      expect(textarea).toHaveAttribute('aria-describedby', 'accessible-textarea-error');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Textarea className="custom-textarea" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('custom-textarea');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Textarea className="mt-4" />);
      const textarea = container.querySelector('textarea');
      expect(textarea).toHaveClass('mt-4', 'w-full', 'px-4', 'py-3');
    });
  });

  describe('組み合わせテスト', () => {
    it('label + error + hint の組み合わせ', () => {
      render(
        <Textarea
          label="Message"
          error="Message too short"
          hint="This hint should not show"
          id="message"
        />
      );
      expect(screen.getByText('Message')).toBeInTheDocument();
      expect(screen.getByText('Message too short')).toBeInTheDocument();
      expect(screen.queryByText('This hint should not show')).not.toBeInTheDocument();
    });

    it('全てのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Textarea
          label="Bio"
          placeholder="Tell us about yourself"
          hint="Maximum 500 characters"
          maxLength={500}
          characterCount
          resizable={false}
          onChange={handleChange}
          className="custom-class"
          id="bio"
          value=""
        />
      );

      expect(screen.getByText('Bio')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us about yourself')).toBeInTheDocument();
      expect(screen.getByText('Maximum 500 characters')).toBeInTheDocument();
      expect(screen.getByText('0/500')).toBeInTheDocument();

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');
      expect(handleChange).toHaveBeenCalled();
    });

    it('characterCount + error の組み合わせ', () => {
      render(
        <Textarea
          characterCount
          maxLength={100}
          error="Error message"
          value="Test"
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('characterCount + hint の組み合わせ（エラーなし）', () => {
      render(
        <Textarea
          characterCount
          maxLength={100}
          hint="Hint message"
          id="test"
          value="Test"
          onChange={() => {}}
        />
      );
      expect(screen.getByText('Hint message')).toBeInTheDocument();
      expect(screen.getByText('4/100')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<Textarea />)).not.toThrow();
    });

    it('空の文字列をlabelに渡してもエラーにならない', () => {
      expect(() => render(<Textarea label="" />)).not.toThrow();
    });

    it('複数のTextareaを同時にレンダリングできる', () => {
      render(
        <>
          <Textarea placeholder="Textarea 1" />
          <Textarea placeholder="Textarea 2" />
          <Textarea placeholder="Textarea 3" />
        </>
      );
      const textareas = screen.getAllByRole('textbox');
      expect(textareas).toHaveLength(3);
    });

    it('value=""の空文字列を処理できる', () => {
      render(<Textarea value="" onChange={() => {}} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('');
    });

    it('非常に長いテキストを処理できる', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, longText);
      expect(textarea).toHaveValue(longText);
    });

    it('characterCountでvalue=undefinedを処理できる', () => {
      render(<Textarea characterCount maxLength={100} value={undefined} onChange={() => {}} />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('refを使ってプログラム的にフォーカスできる', () => {
      const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
      render(<Textarea ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });

    it('refを使って値を取得できる', () => {
      const ref = { current: null } as React.RefObject<HTMLTextAreaElement>;
      render(<Textarea ref={ref} defaultValue="test value" />);
      expect(ref.current?.value).toBe('test value');
    });
  });

  describe('その他のHTML属性', () => {
    it('rows属性が適用される', () => {
      render(<Textarea rows={10} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '10');
    });

    it('cols属性が適用される', () => {
      render(<Textarea cols={50} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '50');
    });

    it('required属性が適用される', () => {
      render(<Textarea required />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeRequired();
    });

    it('name属性が適用される', () => {
      render(<Textarea name="description" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'description');
    });

    it('autoComplete属性が適用される', () => {
      render(<Textarea autoComplete="off" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('autoComplete', 'off');
    });
  });
});
