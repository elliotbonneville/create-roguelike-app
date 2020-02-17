import React from 'react';

import Scene from './Scene';

const App: React.FC = () => {
  return (
    <Scene width={80} height={20}>
      <box width={10} height={10} x={5} y={5} character="#">
        <text x={1} y={1}>
          Hello World
        </text>
      </box>
      <box width={8} height={8} x={6} y={6} character="." />
    </Scene>
  );
};

export default App;
