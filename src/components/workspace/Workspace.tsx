import { useDrop } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { v4 as uuidv4 } from 'uuid';
import { Block } from '../blocks/Block';
import { blockDefinitions } from '@/utils/blockDefinitions';

interface WorkspaceProps {
  blocks: BlockInstance[];
  onBlocksChange: (blocks: BlockInstance[]) => void;
}

export const Workspace = ({ blocks, onBlocksChange }: WorkspaceProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const newBlock: BlockInstance = {
        id: uuidv4(),
        type: item.block.type,
        category: item.block.category,
        x: offset.x,
        y: offset.y,
        value: getDefaultValue(item.block.type),
      };

      onBlocksChange([...blocks, newBlock]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const getDefaultValue = (type: string): string | number | boolean => {
    switch (type) {
      case 'int': return 0;
      case 'string': return '';
      case 'bool': return false;
      case 'print': return '"Hello, World!"';
      case 'input': return '"Enter value: "';
      case 'if':
      case 'while': return 'condition';
      case 'for': return 10;
      case 'comment': return 'Your comment here';
      default: return '';
    }
  };

  return (
    <div
      ref={drop}
      className={`h-full workspace-grid relative overflow-auto transition-all ${
        isOver ? 'ring-2 ring-primary ring-inset' : ''
      }`}
    >
      <div className="absolute inset-0 p-8">
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground text-lg font-medium">
                Drag blocks here to start building
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Create your program by combining blocks from the palette
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block) => {
              const definition = blockDefinitions.find((def) => def.type === block.type);
              if (!definition) return null;
              
              return (
                <div
                  key={block.id}
                  className="inline-block"
                  style={{
                    position: 'relative',
                  }}
                >
                  <Block block={definition} isInPalette={false} />
                  {block.value !== undefined && (
                    <input
                      type="text"
                      value={String(block.value)}
                      onChange={(e) => {
                        const updatedBlocks = blocks.map((b) =>
                          b.id === block.id ? { ...b, value: e.target.value } : b
                        );
                        onBlocksChange(updatedBlocks);
                      }}
                      className="ml-2 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-sm outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="value"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
