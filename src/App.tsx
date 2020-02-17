import React, { useState, useEffect } from 'react';
import Scene from './reactlike/Scene';

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
      >
        <text x={2} y={1}>
          Hello World
        </text>
      </box>
    </Scene>
  );
};

export default App;
