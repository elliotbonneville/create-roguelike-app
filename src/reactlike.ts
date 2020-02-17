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
  shouldSetTextContent: (type: string): boolean => type === 'text',
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
  createTextInstance: (text: string): string => text,
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
  removeChildFromContainer(
    parentInstance: VirtualNode,
    child: VirtualNode,
  ): void {
    parentInstance.removeChild(child);
  },
};
const Renderer = ReactReconciler(hostConfig as any);

export default {
  render: (node: React.ReactNode, rootNode: BaseNode): BaseNode => {
    const isAsync = false;

    if (!rootNode.rootContainer) {
      Object.assign(rootNode, {
        rootContainer: Renderer.createContainer(rootNode, isAsync, false),
      });
    }

    const parentComponent = null;
    Renderer.updateContainer(
      node,
      rootNode.rootContainer,
      parentComponent,
      () => undefined,
    );

    // Renderer.injectIntoDevTools({
    //   bundleType: process.env.NODE_ENV === 'production' ? 0 : 1,
    //   version: '0.1.0',
    //   rendererPackageName: 'react-like',
    //   findHostInstanceByFiber: Renderer.findHostInstance,
    // } as any);

    return rootNode;
  },
};
