import { useDrop } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { v4 as uuidv4 } from 'uuid';
import { WorkspaceBlock } from './WorkspaceBlock';

interface WorkspaceProps {
  blocks: BlockInstance[];
  onBlocksChange: (blocks: BlockInstance[]) => void;
  variables: string[];
}

export const Workspace = ({ blocks, onBlocksChange, variables }: WorkspaceProps) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'block',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return; // Already handled by nested drop

      const newBlock: BlockInstance = {
        id: uuidv4(),
        type: item.block.type,
        category: item.block.category,
        name: ['int', 'string', 'bool'].includes(item.block.type) ? 'variable' : undefined,
        slots: {},
        children: [],
      };

      onBlocksChange([...blocks, newBlock]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const updateBlock = (blockId: string, updates: Partial<BlockInstance>) => {
    const updateBlockRecursive = (blocks: BlockInstance[]): BlockInstance[] => {
      return blocks.map(block => {
        if (block.id === blockId) {
          return { ...block, ...updates };
        }
        if (block.children && block.children.length > 0) {
          return { ...block, children: updateBlockRecursive(block.children) };
        }
        return block;
      });
    };
    onBlocksChange(updateBlockRecursive(blocks));
  };

  const deleteBlock = (blockId: string) => {
    const deleteBlockRecursive = (blocks: BlockInstance[]): BlockInstance[] => {
      return blocks
        .filter(block => block.id !== blockId)
        .map(block => ({
          ...block,
          children: block.children ? deleteBlockRecursive(block.children) : []
        }));
    };
    onBlocksChange(deleteBlockRecursive(blocks));
  };

  const addChildBlock = (parentId: string, childBlock: BlockInstance) => {
    const addChildRecursive = (blocks: BlockInstance[]): BlockInstance[] => {
      return blocks.map(block => {
        if (block.id === parentId) {
          return {
            ...block,
            children: [...(block.children || []), childBlock]
          };
        }
        if (block.children && block.children.length > 0) {
          return { ...block, children: addChildRecursive(block.children) };
        }
        return block;
      });
    };
    onBlocksChange(addChildRecursive(blocks));
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
          <div className="space-y-3">
            {blocks.map((block) => (
              <WorkspaceBlock
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onAddChild={addChildBlock}
                variables={variables}
                depth={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
