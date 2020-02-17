import ReactReconciler from 'react-reconciler';
import {
  createNode,
  NodeType,
  BaseNode,
  BoxNode,
  TextNode,
  VirtualNode,
  ReadWriteAttribute,
} from './renderer';

const rootHostContext = {};
const childHostContext = {};

const hostConfig = {
  now: Date.now,
  getPublicInstance: (instance: BaseNode): BaseNode => instance,
  getRootHostContext: (): {} => {
    return rootHostContext;
  },
  prepareForCommit: (): void => {
    return undefined;
  },
  resetAfterCommit: (): void => {
    return undefined;
  },
  getChildHostContext: (): {} => {
    return childHostContext;
  },
  shouldSetTextContent: (): boolean => false,
  createInstance: (
    type: NodeType,
    newProps: { [key: string]: number | string | (() => {}) },
  ): BaseNode | BoxNode | TextNode => {
    const node = createNode(type);
    Object.keys(newProps).forEach(propName => {
      const propValue = newProps[propName];
      if (propName === 'children') {
        if (typeof propValue === 'string' || typeof propValue === 'number') {
          Object.assign(node, { textContent: propValue });
        }
      } else {
        const newPropValue = newProps[propName];
        node.setAttribute(propName as ReadWriteAttribute, newPropValue);
      }
    });

    return node;
  },
  createTextInstance: (text: string): TextNode => {
    return createNode('text', {
      textContent: text,
    });
  },
  appendInitialChild: (parent: VirtualNode, child: VirtualNode): void => {
    parent.appendChild(child);
  },
  appendChild(parent: VirtualNode, child: VirtualNode): void {
    parent.appendChild(child);
  },
  finalizeInitialChildren: (): void => {
    return undefined;
  },
  supportsMutation: true,
  appendChildToContainer: (parent: VirtualNode, child: VirtualNode): void => {
    parent.appendChild(child);
  },
  prepareUpdate(): boolean {
    return true;
  },
  commitUpdate(
    virtualNode: BaseNode,
    updatePayload: any,
    type: any,
    oldProps: any,
    newProps: any,
  ): void {
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
  },
  commitTextUpdate(textInstance, oldText, newText) {
    Object.assign(textInstance, { text: newText });
  },
  removeChild(parentInstance: VirtualNode, child: VirtualNode): void {
    parentInstance.removeChild(child);
  },
};
const ReactReconcilerInst = ReactReconciler(hostConfig as any);
export default {
  render: (
    reactElement: React.ReactNode,
    virtualNode: BaseNode,
    callback?: () => void,
  ): BaseNode => {
    // Create a root Container if it doesn't exist
    if (!virtualNode.rootContainer) {
      Object.assign(virtualNode, {
        rootContainer: ReactReconcilerInst.createContainer(virtualNode, false),
      });
    }

    // update the root Container
    ReactReconcilerInst.updateContainer(
      reactElement,
      virtualNode.rootContainer,
      null,
      callback,
    );

    return virtualNode;
  },
};
