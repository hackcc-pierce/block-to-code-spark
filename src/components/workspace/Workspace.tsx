import { useDrop } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { v4 as uuidv4 } from 'uuid';
import { WorkspaceBlock } from './WorkspaceBlock';
import { useRef, useEffect, useCallback } from 'react';

// DropZone component for inserting blocks between existing blocks
const DropZone = ({ onDrop, index }: { onDrop: (item: any) => void; index: number }) => {
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ['block', 'workspace-block'],
      drop: (item: any, monitor) => {
        // Process the drop - didDrop() checks if a nested target handled it
        // Since drop zones are top-level, we should process all drops
        const didDrop = monitor.didDrop();
        if (!didDrop) {
          onDrop(item);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDrop, index]
  );

  return (
    <div
      ref={drop}
      className={`relative transition-all z-10 ${
        isOver && canDrop
          ? 'h-12 -my-2 bg-primary/30 border-2 border-primary border-dashed rounded'
          : 'h-4 -my-1 hover:h-6'
      }`}
      style={{ minHeight: isOver && canDrop ? '3rem' : '1rem' }}
    >
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-primary font-medium bg-background px-2 py-1 rounded">
            Drop here to reorder
          </span>
        </div>
      )}
    </div>
  );
};

interface WorkspaceProps {
  blocks: BlockInstance[];
  onBlocksChange: (blocks: BlockInstance[]) => void;
  variables: string[];
  validationErrors?: Map<string, string>;
}

export const Workspace = ({ blocks, onBlocksChange, variables, validationErrors }: WorkspaceProps) => {
  // Use ref to always have access to the latest blocks
  const blocksRef = useRef(blocks);
  
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['block', 'workspace-block'],
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return; // Already handled by nested drop or drop zone

      // If it's a workspace block being dragged (reordering)
      if (item.type === 'workspace-block' && item.blockInstance) {
        // Fallback: if dropped on workspace but not on a drop zone, move to end
        const draggedIndex = blocksRef.current.findIndex(b => b.id === item.blockInstance.id);
        if (draggedIndex !== -1) {
          const targetIndex = blocksRef.current.length - 1;
          // Only move if not already at the end
          if (draggedIndex !== targetIndex) {
            moveBlock(draggedIndex, targetIndex);
          }
        }
        return;
      }

      // New block from palette
      const newBlock: BlockInstance = {
        id: uuidv4(),
        type: item.block.type,
        category: item.block.category,
        name: ['int', 'string', 'bool'].includes(item.block.type) ? '' : undefined,
        slots: {},
        children: [],
      };

      // Use the ref to get the latest blocks value
      onBlocksChange([...blocksRef.current, newBlock]);
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
    onBlocksChange(updateBlockRecursive(blocksRef.current));
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
    onBlocksChange(deleteBlockRecursive(blocksRef.current));
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
    onBlocksChange(addChildRecursive(blocksRef.current));
  };

  const moveBlock = useCallback((dragIndex: number, hoverIndex: number) => {
    // Get the current blocks state
    const currentBlocks = blocksRef.current;
    
    // Validate indices
    if (dragIndex < 0 || dragIndex >= currentBlocks.length) return;
    if (hoverIndex < 0 || hoverIndex > currentBlocks.length) return;
    
    // If dragging to the same position, do nothing
    if (dragIndex === hoverIndex) return;
    
    // Create a new array and move the block
    const newBlocks = [...currentBlocks];
    const [draggedBlock] = newBlocks.splice(dragIndex, 1);
    
    // Calculate the correct insertion index after removal
    // If we removed before the target, the target shifts left by 1
    let insertIndex = hoverIndex;
    if (dragIndex < hoverIndex) {
      insertIndex = hoverIndex - 1;
    }
    
    // Insert at the calculated position
    newBlocks.splice(insertIndex, 0, draggedBlock);
    
    // Update state
    onBlocksChange(newBlocks);
  }, [onBlocksChange]);

  const insertBlockAt = (block: BlockInstance, index: number) => {
    const newBlocks = [...blocksRef.current];
    newBlocks.splice(index, 0, block);
    onBlocksChange(newBlocks);
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
            {blocks.map((block, index) => (
              <div key={block.id} className="relative">
                <DropZone
                  index={index}
                  onDrop={(draggedBlock) => {
                    // If dragging an existing block, reorder it
                    if (draggedBlock.blockInstance) {
                      const currentBlocks = blocksRef.current;
                      const draggedIndex = currentBlocks.findIndex(b => b.id === draggedBlock.blockInstance.id);
                      
                      if (draggedIndex !== -1) {
                        // Only move if the position actually changes
                        // The drop zone at 'index' means insert before the block at 'index'
                        // So we want to move the dragged block to position 'index'
                        if (draggedIndex !== index) {
                          moveBlock(draggedIndex, index);
                        }
                      } else {
                        // Block not found (shouldn't happen, but handle gracefully)
                        insertBlockAt(draggedBlock.blockInstance, index);
                      }
                    } else {
                      // New block from palette
                      const newBlock: BlockInstance = {
                        id: uuidv4(),
                        type: draggedBlock.block.type,
                        category: draggedBlock.block.category,
                        name: ['int', 'string', 'bool'].includes(draggedBlock.block.type) ? 'variable' : undefined,
                        slots: {},
                        children: [],
                      };
                      insertBlockAt(newBlock, index);
                    }
                  }}
                />
                <WorkspaceBlock
                  block={block}
                  index={index}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  onAddChild={addChildBlock}
                  onMove={moveBlock}
                  variables={variables}
                  depth={0}
                  totalBlocks={blocks.length}
                  validationErrors={validationErrors}
                />
              </div>
            ))}
            <DropZone
              index={blocks.length}
              onDrop={(draggedBlock) => {
                // Drop at the end (after the last block)
                if (draggedBlock.blockInstance) {
                  const draggedIndex = blocksRef.current.findIndex(b => b.id === draggedBlock.blockInstance.id);
                  if (draggedIndex !== -1) {
                    // Move to the end
                    const targetIndex = blocksRef.current.length;
                    if (draggedIndex !== targetIndex - 1) {
                      moveBlock(draggedIndex, targetIndex);
                    }
                  } else {
                    insertBlockAt(draggedBlock.blockInstance, blocksRef.current.length);
                  }
                } else {
                  // New block from palette
                  const newBlock: BlockInstance = {
                    id: uuidv4(),
                    type: draggedBlock.block.type,
                    category: draggedBlock.block.category,
                    name: ['int', 'string', 'bool'].includes(draggedBlock.block.type) ? 'variable' : undefined,
                    slots: {},
                    children: [],
                  };
                  insertBlockAt(newBlock, blocksRef.current.length);
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
