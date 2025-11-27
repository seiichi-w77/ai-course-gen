/**
 * Grid - Unit Tests
 * Grid レイアウトコンポーネントのテスト
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Grid } from '../ui/Grid';

describe('Grid', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      const { container } = render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.tagName).toBe('DIV');
    });

    it('子要素が正しくレンダリングされる', () => {
      const { getByText } = render(
        <Grid>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Grid>
      );
      expect(getByText('Item 1')).toBeInTheDocument();
      expect(getByText('Item 2')).toBeInTheDocument();
      expect(getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('cols プロパティ', () => {
    it('cols=1 が適用される（デフォルト）', () => {
      const { container } = render(<Grid cols={1}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid', 'grid-cols-1');
    });

    it('cols=2 が適用される', () => {
      const { container } = render(<Grid cols={2}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-2');
    });

    it('cols=3 が適用される', () => {
      const { container } = render(<Grid cols={3}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-3');
    });

    it('cols=4 が適用される', () => {
      const { container } = render(<Grid cols={4}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-4');
    });

    it('cols=6 が適用される', () => {
      const { container } = render(<Grid cols={6}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-6');
    });

    it('cols=12 が適用される', () => {
      const { container } = render(<Grid cols={12}><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-12');
    });
  });

  describe('gap プロパティ', () => {
    it('gap="sm" が適用される', () => {
      const { container } = render(<Grid gap="sm"><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-2');
    });

    it('gap="md" が適用される（デフォルト）', () => {
      const { container } = render(<Grid gap="md"><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-4');
    });

    it('gap="lg" が適用される', () => {
      const { container } = render(<Grid gap="lg"><div>Item</div></Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('responsive プロパティ', () => {
    it('responsive=false でレスポンシブクラスが適用されない', () => {
      const { container } = render(
        <Grid cols={3} responsive={false}>
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-3');
      expect(grid.className).not.toContain('sm:');
      expect(grid.className).not.toContain('md:');
      expect(grid.className).not.toContain('lg:');
    });

    it('responsive=true で sm/md/lg クラスが適用される', () => {
      const { container } = render(
        <Grid cols={3} responsive={true}>
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('responsive=true + cols=4 で適切なブレークポイントが適用される', () => {
      const { container } = render(
        <Grid cols={4} responsive={true}>
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('responsive=true + cols=12 で12カラムレイアウトが適用される', () => {
      const { container } = render(
        <Grid cols={12} responsive={true}>
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('sm:grid-cols-2', 'md:grid-cols-4', 'lg:grid-cols-12');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <Grid className="custom-grid">
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('custom-grid');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(
        <Grid cols={3} gap="lg" className="mt-4">
          <div>Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid', 'grid-cols-3', 'gap-6', 'mt-4');
    });
  });

  describe('組み合わせテスト', () => {
    it('全てのプロパティを組み合わせて使用できる', () => {
      const { container } = render(
        <Grid cols={4} gap="lg" responsive={true} className="container mx-auto">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
          <div>Item 4</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass(
        'grid',
        'sm:grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-4',
        'gap-6',
        'container',
        'mx-auto'
      );
    });

    it('3カラムグリッド + 中サイズギャップ + レスポンシブ', () => {
      const { container, getByText } = render(
        <Grid cols={3} gap="md" responsive={true}>
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid', 'sm:grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'gap-4');
      expect(getByText('Card 1')).toBeInTheDocument();
      expect(getByText('Card 2')).toBeInTheDocument();
      expect(getByText('Card 3')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('子要素が0個でもエラーにならない', () => {
      const { container } = render(<Grid />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.children).toHaveLength(0);
    });

    it('子要素が1個でも正常にレンダリングされる', () => {
      const { getByText } = render(
        <Grid cols={3}>
          <div>Single Item</div>
        </Grid>
      );
      expect(getByText('Single Item')).toBeInTheDocument();
    });

    it('多数の子要素を扱える', () => {
      const items = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Item {i + 1}</div>
      ));
      const { container } = render(<Grid cols={12}>{items}</Grid>);
      const grid = container.firstChild as HTMLElement;
      expect(grid.children).toHaveLength(100);
    });

    it('ネストされたGridコンポーネント', () => {
      const { container } = render(
        <Grid cols={2} gap="lg">
          <Grid cols={2} gap="sm">
            <div>Nested 1</div>
            <div>Nested 2</div>
          </Grid>
          <div>Item 2</div>
        </Grid>
      );
      const outerGrid = container.firstChild as HTMLElement;
      expect(outerGrid).toHaveClass('grid-cols-2', 'gap-6');
      const innerGrid = outerGrid.firstChild as HTMLElement;
      expect(innerGrid).toHaveClass('grid-cols-2', 'gap-2');
    });
  });

  describe('12カラムシステム', () => {
    it('12カラムグリッドで col-span が使用できる', () => {
      const { container } = render(
        <Grid cols={12} gap="md">
          <div className="col-span-8">Main Content</div>
          <div className="col-span-4">Sidebar</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      expect(grid).toHaveClass('grid-cols-12');
      const mainContent = grid.children[0] as HTMLElement;
      const sidebar = grid.children[1] as HTMLElement;
      expect(mainContent).toHaveClass('col-span-8');
      expect(sidebar).toHaveClass('col-span-4');
    });

    it('レスポンシブな col-span が使用できる', () => {
      const { container } = render(
        <Grid cols={12} gap="md">
          <div className="col-span-12 md:col-span-6 lg:col-span-4">Item</div>
        </Grid>
      );
      const grid = container.firstChild as HTMLElement;
      const item = grid.children[0] as HTMLElement;
      expect(item).toHaveClass('col-span-12', 'md:col-span-6', 'lg:col-span-4');
    });
  });
});
