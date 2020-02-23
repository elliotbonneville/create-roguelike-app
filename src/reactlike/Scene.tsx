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
  config: Partial<CellDataRendererConfig>;
  style?: React.CSSProperties;
  width: number;
  height: number;
}

const useMouseInputManager = ({
  nodeTree,
  canvasRef,
  config,
}: {
  nodeTree: BaseNode;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  config: Partial<CellDataRendererConfig>;
}): void => {
  const [mousePosition, setMousePosition] = useState({ x: -1, y: -1 });
  const [currentTarget, setCurrentTarget] = useState<BaseNode | null>(null);
  const [canvasRect, setCanvasRect] = useState(
    canvasRef.current?.getBoundingClientRect(),
  );

  useEffect(() => {
    setCanvasRect(canvasRef.current?.getBoundingClientRect());
  }, [canvasRef.current]);

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

    if (hitNodes[0] !== currentTarget) {
      if (currentTarget) {
        if (currentTarget.onMouseLeave) {
          currentTarget.onMouseLeave(event);
        }

        setCurrentTarget(hitNodes[0]);
        if (hitNodes[0].onMouseEnter) {
          hitNodes[0].onMouseEnter(event);
        }
      } else {
        setCurrentTarget(hitNodes[0]);
      }
    }

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

  const getMousePosition = (event: MouseEvent): (number | null)[] => {
    if (!canvasRect || !config.cellWidth || !config.cellHeight) {
      return [null, null];
    }

    const dx = Math.floor(
      (event.clientX - canvasRect.left || 0) / config.cellWidth,
    );
    const dy = Math.floor(
      (event.clientY - canvasRect.top || 0) / config.cellHeight,
    );
    return [dx, dy];
  };

  // Mouse event handling
  useEffect(() => {
    if (!canvasRef.current || !nodeTree) {
      return (): void => undefined;
    }

    const handleMouseMove = (event: MouseEvent): void => {
      const [x, y] = getMousePosition(event);
      if (!x || !y) {
        return;
      }

      handleMouseEvent('mousemove', x, y);
    };

    const handleMouseDown = (event: MouseEvent): void => {
      const [x, y] = getMousePosition(event);
      if (!x || !y) {
        return;
      }

      handleMouseEvent('mousedown', x, y);
    };

    const handleMouseUp = (event: MouseEvent): void => {
      const [x, y] = getMousePosition(event);
      if (!x || !y) {
        return;
      }

      handleMouseEvent('mouseup', x, y);
    };

    const handleMouseClick = (event: MouseEvent): void => {
      const [x, y] = getMousePosition(event);
      if (!x || !y) {
        return;
      }

      handleMouseEvent('click', x, y);
    };

    canvasRef.current.addEventListener('mousemove', handleMouseMove);
    canvasRef.current.addEventListener('mousedown', handleMouseDown);
    canvasRef.current.addEventListener('mouseup', handleMouseUp);
    canvasRef.current.addEventListener('click', handleMouseClick);
    return (): void => {
      if (!canvasRef.current) {
        return;
      }

      canvasRef.current.removeEventListener('mousemove', handleMouseMove);
      canvasRef.current.removeEventListener('mousedown', handleMouseDown);
      canvasRef.current.removeEventListener('mouseup', handleMouseUp);
      canvasRef.current.removeEventListener('click', handleMouseClick);
    };
  }, [canvasRef.current, currentTarget, mousePosition]);
};

const useScene = ({
  width,
  height,
  config,
}: {
  width: number;
  height: number;
  config: Partial<CellDataRendererConfig>;
}): {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  nodeTree: BaseNode;
  renderScene: () => void;
} => {
  const canvasRef: React.RefObject<HTMLCanvasElement> = useRef(null);
  const [renderScene, setRenderScene] = useState();
  const [nodeTree, setNodeTree] = useState();

  useEffect(() => {
    const domNode = canvasRef.current;
    if (!domNode) {
      return (): void => undefined;
    }

    const tree = createNodeTree({ width, height });
    const renderSceneCallback = createScene({
      canvas: domNode,
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
      Object.assign(canvasRef.current, { innerHTML: '' });
    };
  }, [width, height]);

  // Event handling
  useMouseInputManager({
    nodeTree,
    canvasRef,
    config,
  });

  return {
    canvasRef,
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
  const { canvasRef, nodeTree, renderScene } = useScene({
    width,
    height,
    config,
  });

  if (renderScene) {
    Reconciler.render(children, nodeTree);
    renderScene();
  }

  return <canvas ref={canvasRef} style={style} />;
};

export default Scene;
