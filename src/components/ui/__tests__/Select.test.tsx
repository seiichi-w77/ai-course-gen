/**
 * Select - Unit Tests
 * Select コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Select } from '../Select';

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

describe('Select', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('optionsが正しく表示される', () => {
      render(<Select options={mockOptions} />);
      const option1 = screen.getByRole('option', { name: /option 1/i });
      const option2 = screen.getByRole('option', { name: /option 2/i });
      const option3 = screen.getByRole('option', { name: /option 3/i });

      expect(option1).toBeInTheDocument();
      expect(option2).toBeInTheDocument();
      expect(option3).toBeInTheDocument();
    });

    it('空のoptions配列でもエラーにならない', () => {
      expect(() => render(<Select options={[]} />)).not.toThrow();
    });
  });

  describe('label プロパティ', () => {
    it('labelが表示される', () => {
      render(<Select options={mockOptions} label="Choose an option" />);
      expect(screen.getByText('Choose an option')).toBeInTheDocument();
    });

    it('labelとselectが正しく関連付けられる', () => {
      render(
        <Select options={mockOptions} label="Country" id="country-select" />
      );
      const label = screen.getByText('Country');
      const select = screen.getByRole('combobox');
      expect(label).toHaveAttribute('for', 'country-select');
      expect(select).toHaveAttribute('id', 'country-select');
    });

    it('labelなしでもエラーにならない', () => {
      expect(() => render(<Select options={mockOptions} />)).not.toThrow();
    });

    it('name属性があればidとして使用される', () => {
      render(<Select options={mockOptions} name="country" label="Country" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('id', 'country');
    });
  });

  describe('placeholder プロパティ', () => {
    it('placeholderが表示される', () => {
      render(
        <Select options={mockOptions} placeholder="Select an option..." />
      );
      const placeholder = screen.getByRole('option', {
        name: /select an option/i,
      }) as HTMLOptionElement;
      expect(placeholder).toBeInTheDocument();
      expect(placeholder.value).toBe('');
      expect(placeholder.disabled).toBe(true);
    });

    it('placeholderなしでもエラーにならない', () => {
      expect(() => render(<Select options={mockOptions} />)).not.toThrow();
    });

    it('placeholderオプションはdisabledになる', () => {
      render(<Select options={mockOptions} placeholder="Choose..." />);
      const placeholder = screen.getByRole('option', {
        name: /choose/i,
      }) as HTMLOptionElement;
      expect(placeholder.disabled).toBe(true);
    });
  });

  describe('オプション表示', () => {
    it('全てのオプションが正しく表示される', () => {
      const options = [
        { value: '1', label: 'First' },
        { value: '2', label: 'Second' },
        { value: '3', label: 'Third' },
        { value: '4', label: 'Fourth' },
      ];
      render(<Select options={options} />);

      expect(screen.getByRole('option', { name: /first/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /second/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /third/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /fourth/i })).toBeInTheDocument();
    });

    it('オプションのvalue属性が正しく設定される', () => {
      render(<Select options={mockOptions} />);
      const option = screen.getByRole('option', {
        name: /option 1/i,
      }) as HTMLOptionElement;
      expect(option.value).toBe('option1');
    });

    it('disabled optionが正しく動作する', () => {
      const options = [
        { value: 'enabled', label: 'Enabled' },
        { value: 'disabled', label: 'Disabled', disabled: true },
      ];
      render(<Select options={options} />);

      const enabledOption = screen.getByRole('option', {
        name: /enabled/i,
      }) as HTMLOptionElement;
      const disabledOption = screen.getByRole('option', {
        name: /disabled/i,
      }) as HTMLOptionElement;

      expect(enabledOption.disabled).toBe(false);
      expect(disabledOption.disabled).toBe(true);
    });
  });

  describe('選択変更', () => {
    it('値を選択できる', async () => {
      const user = userEvent.setup();
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;

      await user.selectOptions(select, 'option2');
      expect(select.value).toBe('option2');
    });

    it('onChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select options={mockOptions} onChange={handleChange} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'option2');
      expect(handleChange).toHaveBeenCalled();
    });

    it('異なる値を複数回選択できる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select options={mockOptions} onChange={handleChange} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;

      await user.selectOptions(select, 'option1');
      expect(select.value).toBe('option1');

      await user.selectOptions(select, 'option3');
      expect(select.value).toBe('option3');

      expect(handleChange).toHaveBeenCalledTimes(2);
    });

    it('defaultValueが正しく設定される', () => {
      render(<Select options={mockOptions} defaultValue="option2" />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });
  });

  describe('error状態', () => {
    it('エラーメッセージが表示される', () => {
      render(<Select options={mockOptions} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('エラー時はaria-invalid="true"が設定される', () => {
      render(<Select options={mockOptions} error="Invalid selection" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
    });

    it('エラーなし時はaria-invalid="false"が設定される', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'false');
    });

    it('エラーメッセージにrole="alert"が設定される', () => {
      render(<Select options={mockOptions} error="Error message" id="test-select" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Error message');
    });

    it('エラー時はaria-describedbyが設定される', () => {
      render(<Select options={mockOptions} error="Error message" id="test-select" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-error');
    });

    it('エラースタイルが適用される', () => {
      const { container } = render(<Select options={mockOptions} error="Error" />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('border-[var(--color-error)]', 'focus:ring-[var(--color-error)]');
    });

    it('エラーがあるときhintは表示されない', () => {
      render(
        <Select
          options={mockOptions}
          error="Error message"
          hint="Hint text"
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Hint text')).not.toBeInTheDocument();
    });
  });

  describe('disabled状態', () => {
    it('disabled属性が適用される', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('disabled時は選択できない', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Select options={mockOptions} disabled onChange={handleChange} />);
      const select = screen.getByRole('combobox');

      await user.selectOptions(select, 'option2');
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('disabledスタイルが適用される', () => {
      const { container } = render(<Select options={mockOptions} disabled />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('hint プロパティ', () => {
    it('hintテキストが表示される', () => {
      render(<Select options={mockOptions} hint="Choose wisely" id="select" />);
      expect(screen.getByText('Choose wisely')).toBeInTheDocument();
    });

    it('hint時はaria-describedbyが設定される', () => {
      render(<Select options={mockOptions} hint="Hint text" id="test-select" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-describedby', 'test-select-hint');
    });

    it('hintスタイルが適用される', () => {
      render(<Select options={mockOptions} hint="Hint text" id="test" />);
      const hint = screen.getByText('Hint text');
      expect(hint).toHaveClass('text-sm', 'text-[var(--color-gray-500)]');
    });
  });

  describe('アクセシビリティ', () => {
    it('role="combobox"が設定される', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('フォーカス時にフォーカスリングが表示される', () => {
      const { container } = render(<Select options={mockOptions} />);
      const select = container.querySelector('select');
      expect(select).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-[var(--color-primary)]');
    });

    it('適切なARIA属性が設定される', () => {
      render(
        <Select
          options={mockOptions}
          id="accessible-select"
          label="Accessible Select"
          error="Error message"
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('aria-invalid', 'true');
      expect(select).toHaveAttribute('aria-describedby', 'accessible-select-error');
    });

    it('ドロップダウンアイコンが表示される', () => {
      const { container } = render(<Select options={mockOptions} />);
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <Select options={mockOptions} className="custom-select" />
      );
      const select = container.querySelector('select');
      expect(select).toHaveClass('custom-select');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(
        <Select options={mockOptions} className="mt-4" />
      );
      const select = container.querySelector('select');
      expect(select).toHaveClass('mt-4', 'w-full', 'h-10', 'px-4');
    });
  });

  describe('組み合わせテスト', () => {
    it('label + error + hint の組み合わせ', () => {
      render(
        <Select
          options={mockOptions}
          label="Country"
          error="Invalid country"
          hint="This hint should not show"
          id="country"
        />
      );
      expect(screen.getByText('Country')).toBeInTheDocument();
      expect(screen.getByText('Invalid country')).toBeInTheDocument();
      expect(screen.queryByText('This hint should not show')).not.toBeInTheDocument();
    });

    it('全てのプロパティを組み合わせて使用できる', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select
          options={mockOptions}
          label="Category"
          placeholder="Select category"
          hint="Choose your category"
          onChange={handleChange}
          className="custom-class"
          id="category"
        />
      );

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /select category/i })).toBeInTheDocument();
      expect(screen.getByText('Choose your category')).toBeInTheDocument();

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option1');
      expect(handleChange).toHaveBeenCalled();
    });

    it('placeholder + options の組み合わせ', () => {
      render(
        <Select
          options={mockOptions}
          placeholder="Choose an option"
        />
      );
      const options = screen.getAllByRole('option');
      // placeholder + 3 regular options = 4 total
      expect(options).toHaveLength(4);
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない（optionsは必須）', () => {
      expect(() => render(<Select options={[]} />)).not.toThrow();
    });

    it('空の文字列をlabelに渡してもエラーにならない', () => {
      expect(() => render(<Select options={mockOptions} label="" />)).not.toThrow();
    });

    it('複数のSelectを同時にレンダリングできる', () => {
      render(
        <>
          <Select options={mockOptions} id="select1" />
          <Select options={mockOptions} id="select2" />
          <Select options={mockOptions} id="select3" />
        </>
      );
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(3);
    });

    it('value=""の空文字列を処理できる', () => {
      const options = [
        { value: '', label: 'None' },
        ...mockOptions,
      ];
      render(<Select options={options} value="" onChange={() => {}} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('');
    });

    it('非常に多くのオプションを処理できる', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option${i}`,
        label: `Option ${i}`,
      }));
      render(<Select options={manyOptions} />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(100);
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLSelectElement>;
      render(<Select options={mockOptions} ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    });

    it('refを使ってプログラム的にフォーカスできる', () => {
      const ref = { current: null } as React.RefObject<HTMLSelectElement>;
      render(<Select options={mockOptions} ref={ref} />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
    });

    it('refを使って値を取得できる', () => {
      const ref = { current: null } as React.RefObject<HTMLSelectElement>;
      render(<Select options={mockOptions} ref={ref} defaultValue="option2" />);
      expect(ref.current?.value).toBe('option2');
    });
  });

  describe('その他のHTML属性', () => {
    it('required属性が適用される', () => {
      render(<Select options={mockOptions} required />);
      const select = screen.getByRole('combobox');
      expect(select).toBeRequired();
    });

    it('name属性が適用される', () => {
      render(<Select options={mockOptions} name="country" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('name', 'country');
    });

    it('autoComplete属性が適用される', () => {
      render(<Select options={mockOptions} autoComplete="country" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('autoComplete', 'country');
    });

    it('form属性が適用される', () => {
      render(<Select options={mockOptions} form="myform" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveAttribute('form', 'myform');
    });
  });
});
