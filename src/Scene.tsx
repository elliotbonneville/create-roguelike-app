import React, { useEffect, useRef, useState } from 'react';
import { createScene, createNodeTree } from './renderer';
import ReactLike from './reactlike';

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
    renderScene();
    ReactLike.render(children, nodeTree);
  }

  return <div ref={containerRef} />;
};

export default Scene;
