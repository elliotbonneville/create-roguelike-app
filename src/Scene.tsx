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

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const tree = ReactLike.render(children, createNodeTree({ width, height }));

    const newRenderScene = createScene({
      baseElement: containerRef.current,
      config: {
        width,
        height,
      },
      nodeTree: tree,
    });

    newRenderScene();
    setRenderScene(renderScene);
  }, []);

  return <div ref={containerRef} />;
};

export default Scene;
