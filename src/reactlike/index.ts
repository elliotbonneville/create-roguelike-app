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
  currentForegroundColor: string;
  backgroundColor: string;
  currentBackgroundColor: string;
  character: string;
  currentCharacter: string;
  x: number;
  y: number;
  readonly element: HTMLDivElement;
}

interface CellData {
  [cellKey: string]: Cell;
}

export interface UpdateCell {
  (x: number, y: number, data: Partial<Cell>): void;
}

export interface CellDataRendererConfig {
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
  totalOffset: { x: number; y: number } = { x: 0, y: 0 },
): Cell[] => {
  const wrappedUpdateCell = (
    x: number,
    y: number,
    data: Partial<Cell>,
  ): void => {
    // eslint-disable-next-line
    node.renderedCells[`${totalOffset.x + x},${totalOffset.y + y}`] = true;
    updateCell(x, y, data);
  };

  Object.assign(node, { renderedCells: {} });
  if ('render' in node) {
    node.render(wrappedUpdateCell);
  }

  node.children.forEach((child: BaseNode) => {
    const offsetUpdateCell = (
      x: number,
      y: number,
      data: Partial<Cell>,
    ): void => {
      updateCell(x + child.x, y + child.y, data);
    };

    renderNodeTree(child, offsetUpdateCell, {
      x: totalOffset.x + child.x,
      y: totalOffset.y + child.y,
    });
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
      // eslint-disable-next-line prefer-template
      const cellKey = x + ',' + y;
      const cell: Cell = {
        foregroundColor: 'white',
        currentForegroundColor: 'white',
        backgroundColor: 'black',
        currentBackgroundColor: 'black',
        character: '',
        currentCharacter: '',
        element: document.createElement('div'),
        x,
        y,
      };

      cell.element.id = cellKey;

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
        color: 'white',
        backgroundColor: 'black',
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
    cell.character =
      typeof data.character !== 'undefined' ? data.character : cell.character;
    cell.foregroundColor = data.foregroundColor || cell.foregroundColor;
    cell.backgroundColor = data.backgroundColor || cell.backgroundColor;
  };

  return (): void => {
    // Clear buffer
    // // TODO: operate on renderedCells buffer in nodes for more efficient
    // // clearing
    // Object.keys(cells).forEach((cellKey: string) => {
    //   const [x, y] = cellKey.split(',');
    //   updateCell(+x, +y, {
    //     character: '',
    //     backgroundColor: 'black',
    //     foregroundColor: 'white',
    //   });
    // });

    // Rasterize node tree to buffer
    renderNodeTree(nodeTree, updateCell);

    // Apply changes in buffer to DOM
    Object.values(cells).forEach(cellToRender => {
      if (cellToRender.character !== cellToRender.currentCharacter) {
        // eslint-disable-next-line no-param-reassign
        cellToRender.currentCharacter = cellToRender.character;

        // eslint-disable-next-line no-param-reassign
        cellToRender.element.innerHTML = cellToRender.character;
      }

      if (
        cellToRender.foregroundColor !== cellToRender.currentForegroundColor
      ) {
        // eslint-disable-next-line no-param-reassign
        cellToRender.currentForegroundColor = cellToRender.foregroundColor;

        // eslint-disable-next-line no-param-reassign
        cellToRender.element.style.color = cellToRender.foregroundColor;
      }

      if (
        cellToRender.backgroundColor !== cellToRender.currentBackgroundColor
      ) {
        // eslint-disable-next-line no-param-reassign
        cellToRender.currentBackgroundColor = cellToRender.backgroundColor;

        // eslint-disable-next-line no-param-reassign
        cellToRender.element.style.color = cellToRender.backgroundColor;
      }
    });
  };
};
