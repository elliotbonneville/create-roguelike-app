import { UpdateCell } from '.';
import { BaseNode } from './base';

export interface BoxNode extends Omit<BaseNode, 'type'> {
  foregroundColor: string;
  backgroundColor: string;
  character: string;
  render: (updateCell: UpdateCell) => void;
}

export function render(this: BoxNode, updateCell: UpdateCell): void {
  for (let x = 0; x < this.width; x += 1) {
    for (let y = 0; y < this.height; y += 1) {
      updateCell(x, y, {
        character: this.character,
        foregroundColor: this.foregroundColor,
        backgroundColor: this.backgroundColor,
      });
    }
  }
}

export default function createBox(
  baseNode: BaseNode,
  data: Partial<BoxNode>,
): BoxNode {
  return {
    type: 'Box',

    // properties
    ...baseNode,
    foregroundColor: 'white',
    backgroundColor: 'black',
    character: '',
    ...data,

    // methods
    render,
  } as BoxNode;
}
