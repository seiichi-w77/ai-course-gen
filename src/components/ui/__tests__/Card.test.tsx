/**
 * Card - Unit Tests
 * Card コンポーネントのテスト
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../Card';

describe('Card', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      const { container } = render(<Card>Card content</Card>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
      render(<Card>Test Content</Card>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('複数の子要素をレンダリングできる', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </Card>
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
      expect(screen.getByText('Child 3')).toBeInTheDocument();
    });
  });

  describe('variant プロパティ', () => {
    it('variant="default"が適用される（デフォルト）', () => {
      const { container } = render(<Card variant="default">Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--surface)]', 'border', 'border-[var(--border)]');
    });

    it('variant="elevated"が適用される', () => {
      const { container } = render(<Card variant="elevated">Elevated</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-[var(--surface)]', 'shadow-[var(--shadow-lg)]');
    });

    it('variant="outlined"が適用される', () => {
      const { container } = render(<Card variant="outlined">Outlined</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-transparent', 'border', 'border-[var(--border)]');
    });
  });

  describe('padding プロパティ', () => {
    it('padding="none"が適用される', () => {
      const { container } = render(<Card padding="none">No padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
    });

    it('padding="sm"が適用される', () => {
      const { container } = render(<Card padding="sm">Small padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-4');
    });

    it('padding="md"が適用される（デフォルト）', () => {
      const { container } = render(<Card padding="md">Medium padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });

    it('padding="lg"が適用される', () => {
      const { container } = render(<Card padding="lg">Large padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-8');
    });

    it('デフォルトでpadding="md"が適用される', () => {
      const { container } = render(<Card>Default padding</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('p-6');
    });
  });

  describe('interactive プロパティ', () => {
    it('interactive=falseでdivとしてレンダリングされる', () => {
      const { container } = render(<Card interactive={false}>Static</Card>);
      expect(container.querySelector('div')).toBeInTheDocument();
    });

    it('interactive=trueでホバー効果が適用される', () => {
      const { container } = render(<Card interactive={true}>Interactive</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer', 'hover:border-[var(--border-hover)]');
    });

    it('デフォルトでinteractive=false', () => {
      const { container } = render(<Card>Default</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).not.toHaveClass('cursor-pointer');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Card className="custom-card">Custom</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Card className="mt-4">Custom</Card>);
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('mt-4', 'rounded-[var(--radius-xl)]');
    });
  });

  describe('組み合わせテスト', () => {
    it('variant + padding + className の組み合わせ', () => {
      const { container } = render(
        <Card variant="elevated" padding="lg" className="custom-class">
          Combined
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-[var(--shadow-lg)]', 'p-8', 'custom-class');
    });

    it('interactive + variant の組み合わせ', () => {
      const { container } = render(
        <Card interactive variant="outlined">
          Interactive Outlined
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('cursor-pointer', 'bg-transparent', 'border');
    });

    it('全てのプロパティを組み合わせて使用できる', () => {
      const { container } = render(
        <Card
          variant="elevated"
          padding="sm"
          interactive
          className="custom-class"
        >
          Full Props
        </Card>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('shadow-[var(--shadow-lg)]', 'p-4', 'cursor-pointer', 'custom-class');
    });
  });

  describe('イベントハンドリング', () => {
    it('onClick イベントが発火する', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Clickable</Card>);
      const card = container.firstChild as HTMLElement;

      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('interactive時にクリックイベントが正しく動作する', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const { container } = render(
        <Card interactive onClick={handleClick}>
          Interactive Click
        </Card>
      );
      const card = container.firstChild as HTMLElement;

      await user.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<Card ref={ref}>Card with ref</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('CardHeader', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(<CardHeader>Header content</CardHeader>);
      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('デフォルトのスタイルが適用される', () => {
      const { container } = render(<CardHeader>Header</CardHeader>);
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5');
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <CardHeader className="custom-header">Header</CardHeader>
      );
      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('custom-header', 'flex', 'flex-col');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('CardTitle', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(<CardTitle>Title</CardTitle>);
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('h3要素としてレンダリングされる', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Title');
    });

    it('デフォルトのスタイルが適用される', () => {
      const { container } = render(<CardTitle>Title</CardTitle>);
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-xl', 'font-semibold', 'tracking-tight');
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <CardTitle className="custom-title">Title</CardTitle>
      );
      const title = container.querySelector('h3');
      expect(title).toHaveClass('custom-title', 'text-xl', 'font-semibold');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLHeadingElement>;
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
    });
  });
});

describe('CardDescription', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(<CardDescription>Description text</CardDescription>);
      expect(screen.getByText('Description text')).toBeInTheDocument();
    });

    it('p要素としてレンダリングされる', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Description');
    });

    it('デフォルトのスタイルが適用される', () => {
      const { container } = render(<CardDescription>Description</CardDescription>);
      const description = container.querySelector('p');
      expect(description).toHaveClass('text-sm', 'text-[var(--color-gray-500)]');
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <CardDescription className="custom-description">Description</CardDescription>
      );
      const description = container.querySelector('p');
      expect(description).toHaveClass('custom-description', 'text-sm');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLParagraphElement>;
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
  });
});

describe('CardContent', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(<CardContent>Content here</CardContent>);
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });

    it('子要素が正しく表示される', () => {
      render(
        <CardContent>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </CardContent>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <CardContent className="custom-content">Content</CardContent>
      );
      const content = container.firstChild as HTMLElement;
      expect(content).toHaveClass('custom-content');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('CardFooter', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      render(<CardFooter>Footer content</CardFooter>);
      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('デフォルトのスタイルが適用される', () => {
      const { container } = render(<CardFooter>Footer</CardFooter>);
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('flex', 'items-center', 'pt-4');
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <CardFooter className="custom-footer">Footer</CardFooter>
      );
      const footer = container.firstChild as HTMLElement;
      expect(footer).toHaveClass('custom-footer', 'flex', 'items-center');
    });
  });

  describe('ref forwarding', () => {
    it('refが正しくフォワードされる', () => {
      const ref = { current: null } as React.RefObject<HTMLDivElement>;
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
});

describe('Card - 完全な統合テスト', () => {
  it('全てのサブコンポーネントを組み合わせて使用できる', () => {
    render(
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card description text</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Main content goes here</p>
        </CardContent>
        <CardFooter>
          <button>Action</button>
        </CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description text')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
  });

  it('複数のCardを同時にレンダリングできる', () => {
    render(
      <>
        <Card>
          <CardTitle>Card 1</CardTitle>
        </Card>
        <Card>
          <CardTitle>Card 2</CardTitle>
        </Card>
        <Card>
          <CardTitle>Card 3</CardTitle>
        </Card>
      </>
    );

    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
    expect(screen.getByText('Card 3')).toBeInTheDocument();
  });

  it('インタラクティブなCardが正しく動作する', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    const { container } = render(
      <Card interactive onClick={handleClick}>
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
        </CardHeader>
        <CardContent>Click me</CardContent>
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    await user.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
