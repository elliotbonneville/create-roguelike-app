import Reconciler from 'react-reconciler';
import { ReadWriteAttribute, VirtualEvent } from '.';

export interface BaseNode {
  x: number;
  y: number;
  width: number;
  height: number;
  children: BaseNode[];
  parent: BaseNode | null;
  rootContainer: Reconciler.FiberRoot | null;
  renderedCells: { [cellKey: string]: boolean };
  appendChild: (node: BaseNode) => void;
  removeChild: (node: BaseNode) => void;
  setAttribute: (name: ReadWriteAttribute, value: string | number) => void;
  handleEvent: (x: number, y: number) => void;
}

export default function createBase(): BaseNode {
  return {
    // properties
    x: 0,
    y: 0,
    width: 80,
    height: 20,
    children: [],
    parent: null,
    rootContainer: null,
    renderedCells: {},

    // methods
    appendChild(this: BaseNode, node: BaseNode): void {
      Object.assign(node, { parent: this });
      this.children.push(node);
    },

    handleEvent(x, y): void {
      const cellKey = `${x},${y}`;
      const hitNodes: BaseNode[] = [];

      const checkNodeForHit = (node: BaseNode): void => {
        if (node.renderedCells[cellKey]) {
          hitNodes.push(node);
        }

        if (node.children.length) {
          node.children.forEach(checkNodeForHit);
        }
      };

      checkNodeForHit(this);
      console.log(cellKey, hitNodes);
    },

    removeChild(this: BaseNode, node: BaseNode): void {
      Object.assign(node, { parent: null });
      this.children = this.children.splice(this.children.indexOf(node), 1);
    },

    setAttribute(
      attributeName: ReadWriteAttribute,
      value: string | number,
    ): void {
      Object.assign(this, {
        [attributeName]: value,
      });
    },
  };
}
