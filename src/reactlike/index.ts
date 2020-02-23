// Components
import createBox, { BoxNode } from './box';
import createText, { TextNode } from './text';
import createBase, { BaseNode } from './base';

// Types
export const Root = 'root';
export const Box = 'box';
export const Text = 'text';
export type NodeType = 'root' | 'box' | 'text';

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
): void => {
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
  canvas,
  config = baseConfig,
  nodeTree: initialNodeTree,
}: {
  canvas: HTMLCanvasElement;
  config?: Partial<CellDataRendererConfig>;
  nodeTree?: BaseNode;
}): (() => void) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const renderContext = canvas.getContext('2d')!;
  const cells: Cell[][] = [];
  const cellList: Cell[] = [];

  const {
    width,
    height,
    cellWidth,
    cellHeight,
    fontSize,
    cellPaddingLeft,
    cellPaddingTop,
  } = Object.assign(baseConfig, config);

  // eslint-disable-next-line no-param-reassign
  canvas.width = cellWidth * width * 2;
  // eslint-disable-next-line no-param-reassign
  canvas.height = cellHeight * height * 2;
  // eslint-disable-next-line no-param-reassign
  canvas.style.width = `${cellWidth * width}px`;
  // eslint-disable-next-line no-param-reassign
  canvas.style.height = `${cellHeight * height}px`;

  renderContext.font = `${fontSize}px VideoTerminalScreen`;
  renderContext.scale(2, 2);

  const nodeTree = initialNodeTree || createNodeTree({ width, height });

  // Create nodes
  for (let x = 0; x < width; x += 1) {
    cells[x] = [];
    for (let y = 0; y < height; y += 1) {
      // eslint-disable-next-line prefer-template
      const cell: Cell = {
        foregroundColor: 'white',
        currentForegroundColor: 'white',
        backgroundColor: 'black',
        currentBackgroundColor: 'black',
        character: ' ',
        currentCharacter: ' ',
        x,
        y,
      };

      cellList.push(cell);
      cells[x][y] = cell;
    }
  }

  const updateCell = (x: number, y: number, data: Partial<Cell>): void => {
    const cell = cells[x]?.[y];

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
    // Rasterize node tree to buffer
    renderNodeTree(nodeTree, updateCell);

    // Clear canvas
    // renderContext.clearRect(0, 0, width * cellWidth, height * cellHeight);

    // Apply changes in buffer to canvas
    for (let x = 0; x < width; x += 1) {
      for (let y = 0; y < height; y += 1) {
        const cellToRender = cells[x][y];
        if (
          cellToRender.character !== cellToRender.currentCharacter ||
          cellToRender.foregroundColor !==
            cellToRender.currentForegroundColor ||
          cellToRender.backgroundColor !== cellToRender.currentBackgroundColor
        ) {
          // eslint-disable-next-line no-param-reassign
          cellToRender.currentCharacter = cellToRender.character;

          // eslint-disable-next-line no-param-reassign
          cellToRender.currentForegroundColor = cellToRender.foregroundColor;

          // eslint-disable-next-line no-param-reassign
          cellToRender.currentBackgroundColor = cellToRender.backgroundColor;

          renderContext.fillStyle = cellToRender.backgroundColor;
          renderContext.fillRect(
            cellToRender.x * cellWidth,
            cellToRender.y * cellHeight,
            cellWidth,
            cellHeight,
          );

          renderContext.fillStyle = cellToRender.foregroundColor;
          renderContext.fillText(
            cellToRender.character,
            cellToRender.x * cellWidth + cellPaddingLeft,
            cellToRender.y * cellHeight + cellPaddingTop,
          );
        }
      }
    }
  };
};
