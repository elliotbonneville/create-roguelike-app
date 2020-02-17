import React, { useEffect, useState } from 'react';

import Scene from './Scene';

const App: React.FC = () => {
  const [width, setWidth] = useState(4);
  useEffect(() => {
    const interval = setInterval(() => {
      setWidth(width + 1);
    }, 1000);

    return (): void => clearInterval(interval);
  }, [width]);

  return (
    <Scene width={80} height={20}>
      <box x={width} y={width} width={13} height={13} character="#">
        <box x={1} y={1} width={11} height={11} character="." />
        <box
          width={4}
          height={4}
          x={3}
          y={3}
          character="~"
          foregroundColor="blue"
        />
        <text x={1} y={1}>
          Hello World
        </text>
      </box>
    </Scene>
  );
};

export default App;
