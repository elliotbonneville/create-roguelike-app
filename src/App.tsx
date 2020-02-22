import React, { useState, useEffect } from 'react';
import Scene, { VirtualEvent } from './reactlike/Scene';

const config = {
  cellWidth: 12,
  cellHeight: 20,
  cellPaddingLeft: 1,
  cellPaddingTop: 2,
  fontSize: 22,
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
  const [dragging, setDragging] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 5,
    y: 5,
  });
  const [initialPosition, setInitialPosition] = useState({
    x: 5,
    y: 5,
  });
  const [position, setPosition] = useState({ x: 5, y: 5 });

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

  const handleMouseMove = ({ x, y }: VirtualEvent): void => {
    if (!dragging) {
      return;
    }

    setPosition({
      x: initialPosition.x + x - initialMousePosition.x,
      y: initialPosition.y + y - initialMousePosition.y,
    });
  };

  const handleMouseDown = ({ x, y }: VirtualEvent): void => {
    setDragging(true);
    setInitialMousePosition({ x, y });
    setInitialPosition({ x: position.x, y: position.y });
  };

  const handleMouseUp = (): void => {
    setDragging(false);
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
        userSelect: 'none',
      }}
    >
      <box
        x={0}
        y={0}
        width={sceneSize.width}
        height={sceneSize.height}
        border="pipe"
        onMouseMove={handleMouseMove}
      >
        <box
          x={position.x}
          y={position.y}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          width={23}
          height={11}
          border="pipe"
          character={dragging ? '.' : ' '}
        >
          <text x={8} y={5} foregroundColor={dragging ? 'red' : 'white'}>
            Drag Me
          </text>
        </box>
      </box>
    </Scene>
  );
};

export default App;
