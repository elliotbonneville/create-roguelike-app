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

    domNode.addEventListener('mousemove', event => {
      if (!(event.target as HTMLDivElement)?.id) {
        return;
      }

      const [x, y] = (event.target as HTMLDivElement).id.split(',');

      tree.handleEvent(+x, +y);
    });

    return (): void => {
      Object.assign(containerRef.current, { innerHTML: '' });
    };
  }, [width, height]);

  if (renderScene) {
    Reconciler.render(children, nodeTree);
    renderScene();
  }

  return <div ref={containerRef} style={style} />;
};

export default Scene;
