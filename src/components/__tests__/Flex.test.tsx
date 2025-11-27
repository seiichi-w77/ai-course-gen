/**
 * Flex - Unit Tests
 * Flex レイアウトコンポーネントのテスト
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Flex } from '../ui/Flex';

describe('Flex', () => {
  describe('レンダリング', () => {
    it('デフォルトで正常にレンダリングされる', () => {
      const { container } = render(
        <Flex>
          <div>Item 1</div>
          <div>Item 2</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toBeInTheDocument();
      expect(flex.tagName).toBe('DIV');
    });

    it('子要素が正しくレンダリングされる', () => {
      const { getByText } = render(
        <Flex>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Flex>
      );
      expect(getByText('Item 1')).toBeInTheDocument();
      expect(getByText('Item 2')).toBeInTheDocument();
      expect(getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('direction プロパティ', () => {
    it('direction="row" が適用される（デフォルト）', () => {
      const { container } = render(
        <Flex direction="row">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex', 'flex-row');
    });

    it('direction="col" が適用される', () => {
      const { container } = render(
        <Flex direction="col">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex', 'flex-col');
    });
  });

  describe('align プロパティ', () => {
    it('align="start" が適用される', () => {
      const { container } = render(
        <Flex align="start">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('items-start');
    });

    it('align="center" が適用される', () => {
      const { container } = render(
        <Flex align="center">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('items-center');
    });

    it('align="end" が適用される', () => {
      const { container } = render(
        <Flex align="end">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('items-end');
    });

    it('align="stretch" が適用される（デフォルト）', () => {
      const { container } = render(
        <Flex align="stretch">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('items-stretch');
    });
  });

  describe('justify プロパティ', () => {
    it('justify="start" が適用される（デフォルト）', () => {
      const { container } = render(
        <Flex justify="start">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('justify-start');
    });

    it('justify="center" が適用される', () => {
      const { container } = render(
        <Flex justify="center">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('justify-center');
    });

    it('justify="end" が適用される', () => {
      const { container } = render(
        <Flex justify="end">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('justify-end');
    });

    it('justify="between" が適用される', () => {
      const { container } = render(
        <Flex justify="between">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('justify-between');
    });

    it('justify="around" が適用される', () => {
      const { container } = render(
        <Flex justify="around">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('justify-around');
    });
  });

  describe('gap プロパティ', () => {
    it('gap が指定されない場合はgapクラスが追加されない', () => {
      const { container } = render(
        <Flex>
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex.className).not.toContain('gap-');
    });

    it('gap="sm" が適用される', () => {
      const { container } = render(
        <Flex gap="sm">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('gap-2');
    });

    it('gap="md" が適用される', () => {
      const { container } = render(
        <Flex gap="md">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('gap-4');
    });

    it('gap="lg" が適用される', () => {
      const { container } = render(
        <Flex gap="lg">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('gap-6');
    });
  });

  describe('wrap プロパティ', () => {
    it('wrap=false でflex-wrapが適用されない（デフォルト）', () => {
      const { container } = render(
        <Flex wrap={false}>
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex.className).not.toContain('flex-wrap');
    });

    it('wrap=true でflex-wrapが適用される', () => {
      const { container } = render(
        <Flex wrap={true}>
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-wrap');
    });
  });

  describe('className プロパティ', () => {
    it('カスタムclassNameが適用される', () => {
      const { container } = render(
        <Flex className="custom-flex">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('custom-flex');
    });

    it('カスタムclassNameが既存のクラスとマージされる', () => {
      const { container } = render(
        <Flex direction="col" align="center" className="mt-4">
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex', 'flex-col', 'items-center', 'mt-4');
    });
  });

  describe('組み合わせテスト', () => {
    it('全てのプロパティを組み合わせて使用できる', () => {
      const { container } = render(
        <Flex
          direction="col"
          align="center"
          justify="between"
          gap="lg"
          wrap={true}
          className="container"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass(
        'flex',
        'flex-col',
        'items-center',
        'justify-between',
        'gap-6',
        'flex-wrap',
        'container'
      );
    });

    it('水平中央揃えレイアウト', () => {
      const { container } = render(
        <Flex direction="row" align="center" justify="center">
          <div>Centered Content</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-row', 'items-center', 'justify-center');
    });

    it('垂直スタックレイアウト', () => {
      const { container } = render(
        <Flex direction="col" gap="md">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-col', 'gap-4');
    });

    it('ヘッダーレイアウト（左右分割）', () => {
      const { container, getByText } = render(
        <Flex direction="row" align="center" justify="between">
          <div>Logo</div>
          <div>Navigation</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-row', 'items-center', 'justify-between');
      expect(getByText('Logo')).toBeInTheDocument();
      expect(getByText('Navigation')).toBeInTheDocument();
    });
  });

  describe('エッジケース', () => {
    it('子要素が0個でもエラーにならない', () => {
      const { container } = render(<Flex />);
      const flex = container.firstChild as HTMLElement;
      expect(flex).toBeInTheDocument();
      expect(flex.children).toHaveLength(0);
    });

    it('子要素が1個でも正常にレンダリングされる', () => {
      const { getByText } = render(
        <Flex>
          <div>Single Item</div>
        </Flex>
      );
      expect(getByText('Single Item')).toBeInTheDocument();
    });

    it('多数の子要素を扱える', () => {
      const items = Array.from({ length: 50 }, (_, i) => (
        <div key={i}>Item {i + 1}</div>
      ));
      const { container } = render(<Flex wrap={true}>{items}</Flex>);
      const flex = container.firstChild as HTMLElement;
      expect(flex.children).toHaveLength(50);
    });

    it('ネストされたFlexコンポーネント', () => {
      const { container } = render(
        <Flex direction="col" gap="lg">
          <Flex direction="row" gap="sm">
            <div>Nested 1</div>
            <div>Nested 2</div>
          </Flex>
          <div>Item 2</div>
        </Flex>
      );
      const outerFlex = container.firstChild as HTMLElement;
      expect(outerFlex).toHaveClass('flex-col', 'gap-6');
      const innerFlex = outerFlex.firstChild as HTMLElement;
      expect(innerFlex).toHaveClass('flex-row', 'gap-2');
    });

    it('全てのデフォルト値で動作する', () => {
      const { container } = render(
        <Flex>
          <div>Item</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex', 'flex-row', 'items-stretch', 'justify-start');
      expect(flex.className).not.toContain('gap-');
      expect(flex.className).not.toContain('flex-wrap');
    });
  });

  describe('実用的なユースケース', () => {
    it('ボタングループレイアウト', () => {
      const { container } = render(
        <Flex direction="row" gap="sm">
          <button>Cancel</button>
          <button>Save</button>
          <button>Submit</button>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-row', 'gap-2');
      expect(flex.children).toHaveLength(3);
    });

    it('フルスクリーン中央配置', () => {
      const { container } = render(
        <Flex align="center" justify="center" className="h-screen">
          <div>Loading...</div>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('items-center', 'justify-center', 'h-screen');
    });

    it('タグリスト（折り返し）', () => {
      const { container } = render(
        <Flex wrap={true} gap="sm">
          <span>Tag 1</span>
          <span>Tag 2</span>
          <span>Tag 3</span>
          <span>Tag 4</span>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-wrap', 'gap-2');
      expect(flex.children).toHaveLength(4);
    });

    it('フォームレイアウト（垂直）', () => {
      const { container } = render(
        <Flex direction="col" gap="md">
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <button>Submit</button>
        </Flex>
      );
      const flex = container.firstChild as HTMLElement;
      expect(flex).toHaveClass('flex-col', 'gap-4');
      expect(flex.children).toHaveLength(3);
    });
  });
});
