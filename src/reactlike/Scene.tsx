import React, { useEffect, useRef, useState } from 'react';
import Reconciler from './reconciler';
import { createScene, createNodeTree, CellDataRendererConfig } from '.';
import { BaseNode } from './base';

export interface VirtualEvent {
  x: number;
  y: number;
  propagationStopped: boolean;
  stopPropagation: () => void;
  target: BaseNode;
}

export interface SceneProps {
  children?: React.ReactNode;
  config?: Partial<CellDataRendererConfig>;
  style?: React.CSSProperties;
  width: number;
  height: number;
}

const useMouseInputManager = ({
  nodeTree,
  containerRef,
}: {
  nodeTree: BaseNode;
  containerRef: React.RefObject<HTMLDivElement>;
}): void => {
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [currentTarget, setCurrentTarget] = useState<BaseNode | null>(null);

  const handleMouseEvent = (eventType: string, x: number, y: number): void => {
    // Ignore duplicate mouse events
    if (
      mousePosition.x === x &&
      mousePosition.y === y &&
      eventType === 'mousemove'
    ) {
      return;
    }

    // Cache mouse position so we can be aware of duplicate mouse events
    setMousePosition({ x, y });

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

    checkNodeForHit(nodeTree);

    hitNodes.reverse();
    const event: VirtualEvent = {
      x,
      y,
      propagationStopped: false,
      stopPropagation() {
        this.propagationStopped = true;
      },
      target: hitNodes[0],
    };

    while (!event.propagationStopped && hitNodes.length) {
      const node = hitNodes.shift();

      if (!node) {
        return;
      }

      switch (eventType) {
        case 'mousemove': {
          if (node.onMouseMove) {
            node.onMouseMove(event);
          }

          if (node !== currentTarget) {
            if (currentTarget !== null) {
              if (currentTarget.onMouseLeave) {
                currentTarget.onMouseLeave(event);
              }

              setCurrentTarget(node);
              if (node.onMouseEnter) {
                node.onMouseEnter(event);
              }
            }
          }

          break;
        }

        case 'mousedown': {
          if (node.onMouseDown) {
            node.onMouseDown(event);
          }

          break;
        }

        case 'mouseup': {
          if (node.onMouseUp) {
            node.onMouseUp(event);
          }

          break;
        }

        case 'click': {
          if (node.onClick) {
            node.onClick(event);
          }

          break;
        }

        default:
          break;
      }
    }
  };

  // Mouse event handling
  useEffect(() => {
    if (!containerRef.current || !nodeTree) {
      return (): void => undefined;
    }

    const handleMouseMove = (event: MouseEvent): void => {
      if (!(event.target as HTMLDivElement)?.id) {
        return;
      }

      const [x, y] = (event.target as HTMLDivElement).id.split(',');
      handleMouseEvent('mousemove', +x, +y);
    };

    const handleMouseDown = (event: MouseEvent): void => {
      if (!(event.target as HTMLDivElement)?.id) {
        return;
      }

      const [x, y] = (event.target as HTMLDivElement).id.split(',');
      handleMouseEvent('mousedown', +x, +y);
    };

    const handleMouseUp = (event: MouseEvent): void => {
      if (!(event.target as HTMLDivElement)?.id) {
        return;
      }

      const [x, y] = (event.target as HTMLDivElement).id.split(',');
      handleMouseEvent('mouseup', +x, +y);
    };

    const handleMouseClick = (event: MouseEvent): void => {
      if (!(event.target as HTMLDivElement)?.id) {
        return;
      }

      const [x, y] = (event.target as HTMLDivElement).id.split(',');
      handleMouseEvent('click', +x, +y);
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('mousedown', handleMouseDown);
    containerRef.current.addEventListener('mouseup', handleMouseUp);
    containerRef.current.addEventListener('click', handleMouseClick);
    return (): void => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.removeEventListener('mousemove', handleMouseMove);
      containerRef.current.removeEventListener('mousedown', handleMouseDown);
      containerRef.current.removeEventListener('mouseup', handleMouseUp);
      containerRef.current.removeEventListener('click', handleMouseClick);
    };
  }, [containerRef.current, currentTarget, mousePosition]);
};

const useScene = ({
  width,
  height,
  config,
}: {
  width: number;
  height: number;
  config?: Partial<CellDataRendererConfig>;
}): {
  containerRef: React.RefObject<HTMLDivElement>;
  nodeTree: BaseNode;
  renderScene: () => void;
} => {
  const containerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [renderScene, setRenderScene] = useState();
  const [nodeTree, setNodeTree] = useState();

  useEffect(() => {
    const domNode = containerRef.current;
    if (!domNode) {
      return (): void => undefined;
    }

    const tree = createNodeTree({ width, height });
    const renderSceneCallback = createScene({
      baseElement: domNode,
      config: {
        ...config,
        width,
        height,
      },
      nodeTree: tree,
    });

    setNodeTree(tree);
    setRenderScene(() => renderSceneCallback);

    return (): void => {
      Object.assign(containerRef.current, { innerHTML: '' });
    };
  }, [width, height]);

  // Event handling
  useMouseInputManager({
    nodeTree,
    containerRef,
  });

  return {
    containerRef,
    nodeTree,
    renderScene,
  };
};

const Scene: React.FC<SceneProps> = ({
  width = 80,
  height = 20,
  config,
  children,
  style,
}: SceneProps) => {
  const { containerRef, nodeTree, renderScene } = useScene({
    width,
    height,
    config,
  });

  if (renderScene) {
    Reconciler.render(children, nodeTree);
    renderScene();
  }

  return <div ref={containerRef} style={style} />;
};

export default Scene;
