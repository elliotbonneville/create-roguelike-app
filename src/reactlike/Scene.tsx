import React, { useEffect, useRef, useState } from 'react';
import Reconciler from './reconciler';
import { createScene, createNodeTree, CellDataRendererConfig } from '.';
import { BaseNode } from './base';

export interface SceneProps {
  children?: React.ReactNode;
  config?: Partial<CellDataRendererConfig>;
  style?: React.CSSProperties;
  width: number;
  height: number;
}

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
      nodeTree.handleMouseEvent('mousemove', +x, +y);
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    return (): void => {
      if (!containerRef.current) {
        return;
      }

      containerRef.current.removeEventListener('mousemove', handleMouseMove);
    };
  }, [containerRef.current]);

  // Keyboard event handling

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
