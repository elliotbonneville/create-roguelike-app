import React, { useState, useEffect } from 'react';
import Scene from './reactlike/Scene';
import { VirtualEvent } from './reactlike';

const config = {
  cellWidth: 16,
  cellHeight: 23,
  cellPaddingLeft: 1,
  cellPaddingTop: 2,
  fontSize: 28,
};

const App: React.FC = () => {
  const [sceneSize, setSceneSize] = useState({
    width: 80,
    height: 20,
  });
  const [sceneOffset, setSceneOffset] = useState({
    left: 0,
    top: 0,
  });
  const [mousePosition, setMousePosition] = useState({
    x: -1,
    y: -1,
  });

  useEffect(() => {
    const width = Math.floor(window.innerWidth / config.cellWidth) - 1;
    const height = Math.floor(window.innerHeight / config.cellHeight) - 1;
    const widthDifference = window.innerWidth - width * config.cellWidth;
    const heightDifference = window.innerHeight - height * config.cellHeight;

    setSceneOffset({
      left: widthDifference / 2,
      top: heightDifference / 2,
    });

    setSceneSize({
      width,
      height,
    });
  }, []);

  const handleMouseOver = (x: number, y: number): void => {
    setMousePosition({ x, y });
  };

  return (
    <Scene
      width={sceneSize.width}
      height={sceneSize.height}
      config={config}
      style={{
        position: 'absolute',
        left: sceneOffset.left,
        top: sceneOffset.top,
      }}
    >
      <box
        x={0}
        y={0}
        width={sceneSize.width}
        height={sceneSize.height}
        border="pipe"
        onMouseOver={handleMouseOver}
      >
        <text
          x={2}
          y={1}
          onMouseEnter={(event: VirtualEvent): void => console.log(event)}
        >
          Hello World
        </text>
      </box>
      {(mousePosition.x > -1 || mousePosition.y > -1) && (
        <box
          x={mousePosition.x}
          y={mousePosition.y}
          width={1}
          height={1}
          character="*"
          foregroundColor="red"
        />
      )}
    </Scene>
  );
};

export default App;
