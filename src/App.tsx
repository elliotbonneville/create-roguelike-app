import React, { useEffect, useRef, useState } from 'react';
import { createCellDataRenderer, createNodeTree, renderNodeTree, createNode, NODE_TYPE } from './renderer';

const App = () => {
  const rootRef: React.RefObject<HTMLDivElement> = useRef(null);
  const [nodeTree] = useState(createNodeTree({
    width: 80,
    height: 20,
  }));

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const { render, updateCell } = createCellDataRenderer({
      baseElement: rootRef.current,
    });

    const box = createNode(NODE_TYPE.BOX, {
      x: 5,
      y: 5,
      width: 10,
      height: 10,
      backgroundCharacter: '#',
    });

    const childBox = createNode(NODE_TYPE.BOX, {
      x: 1,
      y: 1,
      width: 8,
      height: 8,
      backgroundCharacter: '.',
    });

    box.appendChild(childBox);
    nodeTree.appendChild(box);

    renderNodeTree(nodeTree, updateCell);
    render();
  }, [nodeTree]);

  return (
    <div ref={rootRef} />
  )
}

export default App;