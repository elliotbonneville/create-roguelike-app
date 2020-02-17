import ReactReconciler from 'react-reconciler';
import { createNode, NodeType, VirtualNode, ReadWriteAttribute } from '.';

import { BaseNode } from './base';
import { BoxNode } from './box';
import { TextNode } from './text';

const rootHostContext = {};
const childHostContext = {};
const { now } = Date;

const getPublicInstance = (instance: BaseNode): BaseNode => instance;
const getRootHostContext = (): {} => rootHostContext;
const prepareForCommit = (): void => undefined;
const resetAfterCommit = (): void => undefined;
const getChildHostContext = (): {} => childHostContext;

// Determines whether or not to set the textContent prop on a node or to create
// the child as another node
const shouldSetTextContent = (type: string): boolean => type === 'text';

const createInstance = (
  type: NodeType,
  props: {
    [key: string]: string | number;
  },
): BaseNode | BoxNode | TextNode => {
  const node = createNode(type);

  Object.entries(props).forEach(([name, value]) => {
    if (name === 'children') {
      if (typeof value === 'string' || typeof value === 'number') {
        Object.assign(node, { textContent: value });
      }
    } else {
      node.setAttribute(name as ReadWriteAttribute, value);
    }
  });

  return node;
};

const createTextInstance = (text: string): string => text;
const appendChild = (parent: VirtualNode, child: VirtualNode): void => {
  parent.appendChild(child);
};
const finalizeInitialChildren = (): boolean => false;
const prepareUpdate = (): boolean => true;
const commitUpdate = (
  virtualNode: BaseNode,
  updatePayload: any,
  type: any,
  oldProps: any,
  newProps: any,
): void => {
  Object.keys(newProps).forEach(propName => {
    const propValue = newProps[propName];
    if (propName === 'children') {
      if (typeof propValue === 'string' || typeof propValue === 'number') {
        virtualNode.setAttribute('textContent', propValue);
        Object.assign(virtualNode as TextNode, {
          textContent: propValue as string,
        });
      }
    } else {
      virtualNode.setAttribute(propName as ReadWriteAttribute, propValue);
    }
  });
};

const commitTextUpdate = (
  textInstance: TextNode,
  oldText: string,
  newText: string,
): void => {
  if (oldText === newText) {
    return;
  }

  Object.assign(textInstance, { textContent: newText });
};

const removeChild = (parentInstance: VirtualNode, child: VirtualNode): void =>
  parentInstance.removeChild(child);

const Reconciler = ReactReconciler({
  now,
  getPublicInstance,
  getRootHostContext,
  prepareForCommit,
  resetAfterCommit,
  getChildHostContext,
  shouldSetTextContent,
  createInstance,
  createTextInstance,
  appendChild,
  appendInitialChild: appendChild,
  appendChildToContainer: appendChild,
  finalizeInitialChildren,
  prepareUpdate,
  commitUpdate,
  commitTextUpdate,
  removeChild,
  removeChildFromContainer: removeChild,
  supportsMutation: true,
} as any);

export default {
  render: (node: React.ReactNode, rootNode: BaseNode): BaseNode => {
    const isAsync = false;

    if (rootNode.rootContainer === null) {
      Object.assign(rootNode, {
        rootContainer: Reconciler.createContainer(rootNode, isAsync, false),
      });
    }

    const parentComponent = null;
    Reconciler.updateContainer(
      node,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      rootNode.rootContainer!,
      parentComponent,
      () => undefined,
    );

    Reconciler.injectIntoDevTools({
      bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
      version: '0.1.0',
      rendererPackageName: 'react-like',
    });

    return rootNode;
  },
};
