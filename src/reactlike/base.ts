import Reconciler from 'react-reconciler';
import { ReadWriteAttribute } from '.';
import { VirtualEvent } from './Scene';

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
  hasDescendant: (node: BaseNode) => boolean;
  removeChild: (node: BaseNode) => void;
  setAttribute: (name: ReadWriteAttribute, value: string | number) => void;
  // mouse events
  onMouseMove?: (event: VirtualEvent) => void;
  onMouseEnter?: (event: VirtualEvent) => void;
  onMouseLeave?: (event: VirtualEvent) => void;
  onMouseDown?: (event: VirtualEvent) => void;
  onMouseUp?: (event: VirtualEvent) => void;
  onClick?: (event: VirtualEvent) => void;
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

    hasDescendant(node?: BaseNode | null): boolean {
      if (!node || node === null) {
        return false;
      }

      return (
        this.children.includes(node) ||
        this.children.some(child => child.hasDescendant(node))
      );
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
