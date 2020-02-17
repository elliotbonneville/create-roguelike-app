// Components
import createBox, { BoxNode } from './box';
import createText, { TextNode } from './text';
import createBase, { BaseNode } from './base';

// Types
export const Root = 'root';
export const Box = 'box';
export const Text = 'text';
export type NodeType = 'root' | 'box' | 'text';

export interface VirtualEvent {
  x: number;
  y: number;
}

export type ReadWriteAttribute =
  | 'width'
  | 'height'
  | 'foregroundColor'
  | 'backgroundColor'
  | 'textContent';

export type VirtualNode = BaseNode | BoxNode | TextNode;

interface Cell {
  foregroundColor: string;
  backgroundColor: string;
  character: string;
  dirty: boolean;
  readonly element: HTMLDivElement;
}

interface CellData {
  [cellKey: string]: Cell;
}

export interface UpdateCell {
  (x: number, y: number, data: Partial<Cell>): void;
}

interface CellDataRendererConfig {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  cellPaddingLeft: number;
  cellPaddingTop: number;
  fontSize: number;
}

const baseConfig: CellDataRendererConfig = {
  width: 80,
  height: 20,
  cellWidth: 16,
  cellHeight: 23,
  cellPaddingLeft: 1,
  cellPaddingTop: 2,
  fontSize: 28,
};

export const createNode = (
  type: NodeType,
  data?: Partial<BaseNode & BoxNode & TextNode>,
): BaseNode | BoxNode | TextNode => {
  const base: BaseNode = createBase();

  switch (type) {
    case Box: {
      return createBox(base, data as Partial<BoxNode>);
    }

    case Text: {
      return createText(base, data as Partial<TextNode>);
    }

    default:
      return base as BaseNode;
  }
};

export const createNodeTree = ({
  width,
  height,
}: {
  width: number;
  height: number;
}): BaseNode => {
  const rootNode = createNode(Root);
  rootNode.setAttribute('width', width);
  rootNode.setAttribute('height', height);
  return rootNode as BaseNode;
};

export const renderNodeTree = (
  node: BaseNode | BoxNode | TextNode,
  updateCell: UpdateCell,
): void => {
  if ('render' in node) {
    node.render(updateCell);
  }

  node.children.forEach((child: BaseNode) => {
    const offsetUpdateCell = (
      x: number,
      y: number,
      data: Partial<Cell>,
    ): void => {
      updateCell(x + child.x, y + child.y, data);
    };

    renderNodeTree(child, offsetUpdateCell);
  });
};

// Create a singleton to hold a scene and render it
export const createScene = ({
  baseElement,
  config = baseConfig,
  nodeTree: initialNodeTree,
}: {
  baseElement: HTMLDivElement;
  config?: Partial<CellDataRendererConfig>;
  nodeTree?: BaseNode;
}): (() => void) => {
  const documentFragment = document.createDocumentFragment();
  const cells: CellData = {};

  const {
    width,
    height,
    cellWidth,
    cellHeight,
    fontSize,
    cellPaddingLeft,
    cellPaddingTop,
  } = Object.assign(baseConfig, config);

  const nodeTree = initialNodeTree || createNodeTree({ width, height });

  // Create nodes
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      const cellKey = `${x},${y}`;
      const cell: Cell = {
        foregroundColor: 'white',
        backgroundColor: 'black',
        character: '',
        dirty: true,
        element: document.createElement('div'),
      };

      // Create DOM node for cell
      Object.assign(cell.element.style, {
        fontFamily: 'VideoTerminalScreen',
        fontSize: `${fontSize}px`,
        position: 'absolute',
        width: `${cellWidth}px`,
        height: `${cellHeight}px`,
        left: `${x * cellWidth}px`,
        top: `${y * cellHeight}px`,
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: `${cellHeight}px`,
        paddingLeft: `${cellPaddingLeft}px`,
        paddingTop: `${cellPaddingTop}px`,
      });

      documentFragment.appendChild(cell.element);
      Object.assign(cells, { [cellKey]: cell });
    }
  }

  baseElement.appendChild(documentFragment);

  const updateCell = (x: number, y: number, data: Partial<Cell>): void => {
    const cell = cells[`${x},${y}`];

    if (!cell) {
      return;
    }

    // Compare data here – if it's not different, don't flag tile as dirty
    const dirty = Object.keys(data).some(
      key => data[key as keyof Cell] !== cell[key as keyof Cell],
    );

    Object.assign(cell, {
      ...data,
      dirty,
    });
  };

  return (): void => {
    // Clear buffer
    Object.keys(cells).forEach((cellKey: string) => {
      const [x, y] = cellKey.split(',');
      updateCell(+x, +y, {
        character: '',
        backgroundColor: 'black',
        foregroundColor: 'white',
      });
    });

    // Rasterize node tree to buffer
    renderNodeTree(nodeTree, updateCell);

    // Apply changes in buffer to DOM
    Object.values(cells).forEach(cellToRender => {
      if (!cellToRender.dirty) {
        return;
      }

      Object.assign(cellToRender.element, {
        innerHTML: cellToRender.character,
      });

      Object.assign(cellToRender.element.style, {
        color: cellToRender.foregroundColor,
        backgroundColor: cellToRender.backgroundColor,
      });

      Object.assign(cellToRender, { dirty: false });
    });
  };
};
