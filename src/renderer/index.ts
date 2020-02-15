export enum NODE_TYPE {
  ROOT,
  BOX
};

interface VirtualEvent {}

type ReadWriteAttribute = 'width' | 'height' | 'foregroundColor' | 'backgroundColor';

interface BaseNode {
  type: NODE_TYPE;
  x: number;
  y: number;
  width: number;
  height: number;
  foregroundColor: string;
  backgroundColor: string;
  backgroundCharacter: string;
  eventListeners: ((event: VirtualEvent) => void)[];
  children: BaseNode[];
  parent: BaseNode | null;
  appendChild: (node: BaseNode) => void;
  removeChild: (node: BaseNode) => void;
  render: (updateCell: UpdateCell) => void;
  setAttribute: (name: ReadWriteAttribute, value: string | number) => void;
}

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

interface UpdateCell {
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
};

const baseConfig: CellDataRendererConfig = {
  width: 80,
  height: 20,
  cellWidth: 16,
  cellHeight: 23,
  cellPaddingLeft: 1,
  cellPaddingTop: 2,
  fontSize: 28,
};

export const createNode = (type: NODE_TYPE, data?: Partial<BaseNode>) => {
  const baseNode: BaseNode = {
    // properties
    type,
    eventListeners: [],
    x: 0,
    y: 0,
    width: 80,
    height: 20,
    foregroundColor: 'white',
    backgroundColor: 'black',
    backgroundCharacter: '',
    children: [],
    parent: null,
    ...data,

    // methods
    appendChild(node: BaseNode) {
      node.parent = this;
      this.children.push(node);
    },

    removeChild(node: BaseNode) {
      node.parent = null;
      this.children = this.children.splice(this.children.indexOf(node), 1);
    },

    render(updateCell: UpdateCell) {},

    setAttribute(attributeName: ReadWriteAttribute, value: string | number) {
      Object.assign(
        this,
        {
          [attributeName]: value,
        },
      );
    },
  };

  switch (type) {
    case NODE_TYPE.ROOT: {
      baseNode.render = function (updateCell: UpdateCell) {};
      return baseNode;
    }

    case NODE_TYPE.BOX: {
      baseNode.render = function (updateCell: UpdateCell) {
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.height; y++) {
            updateCell(
              x,
              y,
              {
                character: this.backgroundCharacter,
                foregroundColor: this.foregroundColor,
                backgroundColor: this.backgroundColor,
              },
            );
          }
        }
      };
      return baseNode;
    }

    default:
      return baseNode;
  }
}

export const createNodeTree = ({
  width,
  height
}: {
  width: number,
  height: number,
}) => {
  const rootNode = createNode(NODE_TYPE.ROOT)!;
  rootNode.setAttribute('width', width);
  rootNode.setAttribute('height', height);
  return rootNode;
};

export const renderNodeTree = (node: BaseNode, updateCell: UpdateCell) => {
  node.render(updateCell);
  node.children.forEach(
    (child: BaseNode) => {
      const offsetUpdateCell = (x: number, y: number, data: Partial<Cell>) => {
        updateCell(x + child.x, y + child.y, data);
      };

      renderNodeTree(child, offsetUpdateCell);
    },
  )
};

// Create a singleton to render cell data to the DOM
export const createCellDataRenderer = ({
  baseElement,
  config = baseConfig,
}: {
  baseElement: HTMLDivElement,
  config?: CellDataRendererConfig,
}) => {
  const documentFragment = document.createDocumentFragment();
  const cells: CellData = {};

  // Create nodes
  for (let x = 0; x < config.width; x++) {
    for (let y = 0; y < config.height; y++) {
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
        fontSize: `${config.fontSize}px`,
        position: 'absolute',
        width: `${config.cellWidth}px`,
        height: `${config.cellHeight}px`,
        left: `${x * config.cellWidth}px`,
        top: `${y * config.cellHeight}px`,
        textAlign: 'center',
        verticalAlign: 'middle',
        lineHeight: `${config.cellHeight}px`,
        paddingLeft: `${config.cellPaddingLeft}px`,
        paddingTop: `${config.cellPaddingTop}px`,
      });

      documentFragment.appendChild(cell.element);
      Object.assign(cells, { [cellKey]: cell });
    }
  }

  baseElement.appendChild(documentFragment);

  return {
    updateCell: (x: number, y: number, data: Partial<Cell>) => {
      const cell = cells[`${x},${y}`];

      if (!cell) {
        return;
      }

      // Compare data here – if it's not different, don't flag tile as dirty
      const dirty = Object.keys(data).some(
        (key) => data[key as keyof Cell] !== cell[key as keyof Cell]
      );

      Object.assign(
        cell,
        {
          ...data,
          dirty,
        },
      );
    },

    render: () => {
      Object.entries(cells).forEach(([key, cell]) => {
        if (!cell.dirty) {
          return;
        }

        cell.element.innerHTML = cell.character;
        Object.assign(
          cell.element.style,
          {
            color: cell.foregroundColor,
            backgroundColor: cell.backgroundColor,
          }
        );

        cell.dirty = false;
      });
    },
  };
};