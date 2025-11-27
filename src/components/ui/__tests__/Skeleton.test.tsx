/**
 * Skeleton - Unit Tests
 * Skeleton コンポーネントのテスト
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Skeleton, CardSkeleton, ListSkeleton } from '../Skeleton';

describe('Skeleton', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('variantなしでもエラーにならない', () => {
      expect(() => render(<Skeleton />)).not.toThrow();
    });
  });

  describe('variant プロパティ', () => {
    it('variant="rectangle"が適用される（デフォルト）', () => {
      const { container } = render(<Skeleton variant="rectangle" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-[var(--radius-lg)]');
    });

    it('variant="circle"が適用される', () => {
      const { container } = render(<Skeleton variant="circle" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('variant="button"が適用される', () => {
      const { container } = render(<Skeleton variant="button" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-[var(--radius-lg)]');
    });

    it('variant="text"が適用される', () => {
      const { container } = render(<Skeleton variant="text" />);
      const skeletonContainer = container.firstChild as HTMLElement;
      expect(skeletonContainer).toBeInTheDocument();
      // text variant creates a container with multiple lines
      const lines = skeletonContainer.querySelectorAll('div.h-4');
      expect(lines.length).toBeGreaterThan(0);
    });
  });

  describe('width/height プロパティ', () => {
    it('width数値が正しく適用される', () => {
      const { container } = render(<Skeleton width={200} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '200px' });
    });

    it('width文字列が正しく適用される', () => {
      const { container } = render(<Skeleton width="50%" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '50%' });
    });

    it('height数値が正しく適用される', () => {
      const { container } = render(<Skeleton height={100} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '100px' });
    });

    it('height文字列が正しく適用される', () => {
      const { container } = render(<Skeleton height="10rem" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '10rem' });
    });

    it('widthとheightを同時に設定できる', () => {
      const { container } = render(<Skeleton width={300} height={150} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '300px', height: '150px' });
    });
  });

  describe('circle variant サイズ', () => {
    it('circleでwidthが優先される', () => {
      const { container } = render(<Skeleton variant="circle" width={50} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '50px', height: '50px' });
    });

    it('circleでheightが優先される', () => {
      const { container } = render(<Skeleton variant="circle" height={60} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '60px', height: '60px' });
    });

    it('circleでwidthとheightの両方がある場合、widthが優先される', () => {
      const { container } = render(
        <Skeleton variant="circle" width={70} height={80} />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '70px', height: '70px' });
    });

    it('circleでデフォルトサイズが適用される', () => {
      const { container } = render(<Skeleton variant="circle" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
    });
  });

  describe('button variant サイズ', () => {
    it('buttonでデフォルトサイズが適用される', () => {
      const { container } = render(<Skeleton variant="button" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ height: '40px', width: '100px' });
    });

    it('buttonでカスタムサイズが適用される', () => {
      const { container } = render(
        <Skeleton variant="button" width={150} height={50} />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '150px', height: '50px' });
    });
  });

  describe('text variant lines', () => {
    it('lines=1でテキストラインが1つ生成される', () => {
      const { container } = render(<Skeleton variant="text" lines={1} />);
      const parentContainer = container.firstChild as HTMLElement;
      const lines = parentContainer.querySelectorAll('div.h-4');
      expect(lines).toHaveLength(1);
    });

    it('lines=3でテキストラインが3つ生成される', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const parentContainer = container.firstChild as HTMLElement;
      const lines = parentContainer.querySelectorAll('div.h-4');
      expect(lines).toHaveLength(3);
    });

    it('lines=5でテキストラインが5つ生成される', () => {
      const { container } = render(<Skeleton variant="text" lines={5} />);
      const parentContainer = container.firstChild as HTMLElement;
      const lines = parentContainer.querySelectorAll('div.h-4');
      expect(lines).toHaveLength(5);
    });

    it('最後のラインは70%の幅になる', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const parentContainer = container.firstChild as HTMLElement;
      const lines = parentContainer.querySelectorAll('div.h-4');
      const lastLine = lines[lines.length - 1] as HTMLElement;
      expect(lastLine).toHaveStyle({ width: '70%' });
    });

    it('最後でないラインは100%の幅になる', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />);
      const parentContainer = container.firstChild as HTMLElement;
      const lines = parentContainer.querySelectorAll('div.h-4');
      const firstLine = lines[0] as HTMLElement;
      expect(firstLine).toHaveStyle({ width: '100%' });
    });
  });

  describe('animate プロパティ', () => {
    it('animate=trueでアニメーションクラスが適用される（デフォルト）', () => {
      const { container } = render(<Skeleton animate={true} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('animate=falseでアニメーションクラスが適用されない', () => {
      const { container } = render(<Skeleton animate={false} />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).not.toHaveClass('animate-pulse');
    });

    it('デフォルトでanimate=true', () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('animate-pulse');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('custom-skeleton');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(<Skeleton className="mt-4" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('mt-4', 'bg-[var(--color-gray-200)]');
    });
  });

  describe('組み合わせテスト', () => {
    it('variant + width + height + animate の組み合わせ', () => {
      const { container } = render(
        <Skeleton
          variant="rectangle"
          width={400}
          height={200}
          animate={false}
          className="custom-class"
        />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveStyle({ width: '400px', height: '200px' });
      expect(skeleton).not.toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('custom-class');
    });

    it('circle + カスタムサイズ + アニメーションなし', () => {
      const { container } = render(
        <Skeleton variant="circle" width={80} animate={false} />
      );
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveClass('rounded-full');
      expect(skeleton).toHaveStyle({ width: '80px', height: '80px' });
      expect(skeleton).not.toHaveClass('animate-pulse');
    });

    it('text + 複数行 + カスタムクラス', () => {
      const { container } = render(
        <Skeleton variant="text" lines={4} className="custom-text" />
      );
      const skeletonContainer = container.firstChild as HTMLElement;
      const lines = skeletonContainer.querySelectorAll('div.h-4');
      expect(lines).toHaveLength(4);
      // text variant applies space-y-2 by default and classname is passed as props
      expect(skeletonContainer).toHaveClass('space-y-2');
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<Skeleton />)).not.toThrow();
    });

    it('lines=0でもエラーにならない', () => {
      expect(() => render(<Skeleton variant="text" lines={0} />)).not.toThrow();
    });

    it('width=0でもエラーにならない', () => {
      expect(() => render(<Skeleton width={0} />)).not.toThrow();
    });

    it('height=0でもエラーにならない', () => {
      expect(() => render(<Skeleton height={0} />)).not.toThrow();
    });

    it('複数のSkeletonを同時にレンダリングできる', () => {
      const { container } = render(
        <>
          <Skeleton variant="circle" />
          <Skeleton variant="rectangle" />
          <Skeleton variant="text" />
        </>
      );
      const skeletons = container.querySelectorAll('.bg-\\[var\\(--color-gray-200\\)\\]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('その他のHTML属性', () => {
    it('data-testid属性が適用される', () => {
      render(<Skeleton data-testid="custom-skeleton" />);
      expect(screen.getByTestId('custom-skeleton')).toBeInTheDocument();
    });

    it('role属性が適用される', () => {
      const { container } = render(<Skeleton role="status" />);
      const skeleton = container.firstChild as HTMLElement;
      expect(skeleton).toHaveAttribute('role', 'status');
    });
  });
});

describe('CardSkeleton', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      const { container } = render(<CardSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('rectangle skeletonが含まれる', () => {
      const { container } = render(<CardSkeleton />);
      const rectangles = container.querySelectorAll('.rounded-\\[var\\(--radius-lg\\)\\]');
      expect(rectangles.length).toBeGreaterThan(0);
    });

    it('text skeletonが含まれる', () => {
      const { container } = render(<CardSkeleton />);
      const texts = container.querySelectorAll('.rounded-\\[var\\(--radius-md\\)\\]');
      expect(texts.length).toBeGreaterThan(0);
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(<CardSkeleton className="custom-card-skeleton" />);
      const cardSkeleton = container.firstChild as HTMLElement;
      expect(cardSkeleton).toHaveClass('custom-card-skeleton');
    });
  });

  describe('エッジケース', () => {
    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<CardSkeleton />)).not.toThrow();
    });

    it('複数のCardSkeletonを同時にレンダリングできる', () => {
      const { container } = render(
        <>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </>
      );
      const skeletons = container.querySelectorAll('.space-y-4');
      expect(skeletons).toHaveLength(3);
    });
  });
});

describe('ListSkeleton', () => {
  describe('レンダリング', () => {
    it('正常にレンダリングされる', () => {
      const { container } = render(<ListSkeleton />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('デフォルトで3つのアイテムが表示される', () => {
      const { container } = render(<ListSkeleton />);
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items).toHaveLength(3);
    });

    it('count=1で1つのアイテムが表示される', () => {
      const { container } = render(<ListSkeleton count={1} />);
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items).toHaveLength(1);
    });

    it('count=5で5つのアイテムが表示される', () => {
      const { container } = render(<ListSkeleton count={5} />);
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items).toHaveLength(5);
    });

    it('各アイテムにcircle skeletonが含まれる', () => {
      const { container } = render(<ListSkeleton count={2} />);
      const circles = container.querySelectorAll('.rounded-full');
      expect(circles.length).toBeGreaterThanOrEqual(2);
    });

    it('カスタムclassNameが適用される', () => {
      const { container } = render(<ListSkeleton className="custom-list-skeleton" />);
      const listSkeleton = container.firstChild as HTMLElement;
      expect(listSkeleton).toHaveClass('custom-list-skeleton');
    });
  });

  describe('エッジケース', () => {
    it('count=0でもエラーにならない', () => {
      expect(() => render(<ListSkeleton count={0} />)).not.toThrow();
    });

    it('count=10で10個のアイテムをレンダリングできる', () => {
      const { container } = render(<ListSkeleton count={10} />);
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items).toHaveLength(10);
    });

    it('全てのプロパティを省略してもエラーにならない', () => {
      expect(() => render(<ListSkeleton />)).not.toThrow();
    });

    it('複数のListSkeletonを同時にレンダリングできる', () => {
      const { container } = render(
        <>
          <ListSkeleton count={2} />
          <ListSkeleton count={3} />
        </>
      );
      const skeletons = container.querySelectorAll('.space-y-3');
      expect(skeletons).toHaveLength(2);
    });
  });

  describe('組み合わせテスト', () => {
    it('count + className の組み合わせ', () => {
      const { container } = render(
        <ListSkeleton count={4} className="custom-list" />
      );
      const listSkeleton = container.firstChild as HTMLElement;
      // className is applied via spread operator
      expect(listSkeleton).toHaveClass('custom-list');
      const items = container.querySelectorAll('.flex.items-center.gap-3');
      expect(items).toHaveLength(4);
    });
  });
});
