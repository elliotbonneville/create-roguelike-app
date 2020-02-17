import { UpdateCell } from '.';
import { BoxNode } from './box';
import { BaseNode } from './base';

export interface TextNode extends BaseNode, BoxNode {
  type: 'TextNode';
  textContent: string;
  render: (updateCell: UpdateCell) => void;
}

export function render(this: TextNode, updateCell: UpdateCell): void {
  const lines = `${this.textContent}`.split('\n');
  lines.forEach((line, y) => {
    for (let x = 0; x < line.length; x += 1) {
      updateCell(x, y, {
        character: line[x],
        foregroundColor: this.foregroundColor,
        backgroundColor: this.backgroundColor,
      });
    }
  });
}

export default function(baseNode: BaseNode, data: Partial<TextNode>): TextNode {
  return {
    type: 'TextNode',

    ...baseNode,
    foregroundColor: 'white',
    backgroundColor: 'black',
    textContent: '',
    ...data,

    // methods
    render,
  } as TextNode;
}
