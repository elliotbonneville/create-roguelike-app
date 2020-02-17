import React, { useEffect, useRef, useState } from 'react';
import Reconciler from './reconciler';
import { createScene, createNodeTree } from '.';

export interface SceneProps {
  children?: React.ReactNode;
  width: number;
  height: number;
}

const Scene: React.FC<SceneProps> = ({
  width = 80,
  height = 20,
  children,
}: SceneProps) => {
  const containerRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [renderScene, setRenderScene] = useState();
  const [nodeTree, setNodeTree] = useState();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const tree = createNodeTree({ width, height });
    const renderSceneCallback = createScene({
      baseElement: containerRef.current,
      config: {
        width,
        height,
      },
      nodeTree: tree,
    });

    setNodeTree(tree);
    setRenderScene(() => renderSceneCallback);
  }, [height, width]);

  if (renderScene) {
    Reconciler.render(children, nodeTree);
    renderScene();
  }

  return <div ref={containerRef} />;
};

export default Scene;
