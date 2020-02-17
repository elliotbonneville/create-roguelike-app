import Reconciler from 'react-reconciler';
import { ReadWriteAttribute, VirtualEvent } from '.';

export interface BaseNode {
  x: number;
  y: number;
  width: number;
  height: number;
  eventListeners: ((event: VirtualEvent) => void)[];
  children: BaseNode[];
  parent: BaseNode | null;
  rootContainer: Reconciler.FiberRoot | null;
  appendChild: (node: BaseNode) => void;
  removeChild: (node: BaseNode) => void;
  setAttribute: (name: ReadWriteAttribute, value: string | number) => void;
}

export default function createBase(): BaseNode {
  return {
    // properties
    eventListeners: [],
    x: 0,
    y: 0,
    width: 80,
    height: 20,
    children: [],
    parent: null,
    rootContainer: null,

    // methods
    appendChild(this: BaseNode, node: BaseNode): void {
      Object.assign(node, { parent: this });
      this.children.push(node);
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
