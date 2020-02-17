import { UpdateCell } from '.';
import { BaseNode } from './base';

export interface BoxNode extends Omit<BaseNode, 'type'> {
  foregroundColor: string;
  backgroundColor: string;
  character: string;
  borderColor: string;
  border: 'pipe' | string;
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

  if (this.border) {
    switch (this.border) {
      case 'pipe': {
        for (let x = 0; x < this.width; x += 1) {
          updateCell(x, 0, { character: '-' });
        }

        for (let x = 0; x < this.width; x += 1) {
          updateCell(x, this.height - 1, { character: '-' });
        }

        for (let y = 0; y < this.height; y += 1) {
          updateCell(0, y, { character: '|' });
        }

        for (let y = 0; y < this.height; y += 1) {
          updateCell(this.width - 1, y, { character: '|' });
        }

        updateCell(0, 0, {
          character: 'Ú',
        });

        updateCell(this.width - 1, 0, {
          character: '¿',
        });

        updateCell(this.width - 1, this.height - 1, {
          character: 'Ù',
        });

        updateCell(0, this.height - 1, {
          character: 'À',
        });

        break;
      }

      default:
        break;
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
