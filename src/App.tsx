import React from 'react';
import Scene from './reactlike/Scene';

const App: React.FC = () => {
  return (
    <Scene width={80} height={20}>
      <box x={5} y={5} width={13} height={13} character="#">
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
