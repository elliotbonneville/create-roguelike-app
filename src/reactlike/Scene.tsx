import React, { useEffect, useRef, useState } from 'react';
import Reconciler from './reconciler';
import { createScene, createNodeTree, CellDataRendererConfig } from '.';

export interface SceneProps {
  children?: React.ReactNode;
  config?: Partial<CellDataRendererConfig>;
  style?: React.CSSProperties;
  width: number;
  height: number;
}

const Scene: React.FC<SceneProps> = ({
  width = 80,
  height = 20,
  config,
  children,
  style,
}: SceneProps) => {
  const containerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [renderScene, setRenderScene] = useState();
  const [nodeTree, setNodeTree] = useState();

  useEffect(() => {
    if (!containerRef.current) {
      return null;
    }

    const tree = createNodeTree({ width, height });
    const renderSceneCallback = createScene({
      baseElement: containerRef.current,
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
  }, [height, width]);

  if (renderScene) {
    Reconciler.render(children, nodeTree);
    renderScene();
  }

  return <div ref={containerRef} style={style} />;
};

export default Scene;
