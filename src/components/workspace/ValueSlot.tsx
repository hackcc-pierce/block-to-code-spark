import React from 'react';
import { useDrop } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';
import { WorkspaceBlock } from './WorkspaceBlock';

interface ValueSlotProps {
  slotName: string;
  slotValue: any;
  block: BlockInstance;
  onUpdate: (blockId: string, updates: Partial<BlockInstance>) => void;
  variables: string[];
  depth: number;
  validationErrors?: Map<string, string>;
  renderInput: () => React.ReactNode;
}

export const ValueSlot = ({
  slotName,
  slotValue,
  block,
  onUpdate,
  variables,
  depth,
  validationErrors,
  renderInput,
}: ValueSlotProps) => {
  const [{ isOverValue }, dropRef] = useDrop(() => ({
    accept: 'block',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      // Accept arithmetic blocks for value slots
      if (item.block.category === 'arithmetic') {
        const newBlock: BlockInstance = {
          id: uuidv4(),
          type: item.block.type,
          category: item.block.category,
          slots: {},
          children: [],
        };
        
        onUpdate(block.id, {
          slots: { ...block.slots, [slotName]: newBlock }
        });
      }
    },
    canDrop: (item: any) => {
      return item.block?.category === 'arithmetic';
    },
    collect: (monitor) => ({
      isOverValue: monitor.isOver({ shallow: true }),
    }),
  }), [block.id, slotName, onUpdate]);

  // If slot contains a BlockInstance (arithmetic or conditional block), render it
  if (slotValue && typeof slotValue === 'object' && 'type' in slotValue) {
    const nestedBlock = slotValue as BlockInstance;
    return (
      <div className="inline-flex items-center gap-1 relative group/nested">
        <WorkspaceBlock
          block={nestedBlock}
          onUpdate={(blockId, updates) => {
            if (blockId === nestedBlock.id) {
              const updatedBlock = { ...nestedBlock, ...updates };
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: updatedBlock }
              });
            }
          }}
          onDelete={() => {
            onUpdate(block.id, {
              slots: { ...block.slots, [slotName]: '' }
            });
          }}
          onAddChild={() => {}}
          variables={variables}
          depth={depth + 1}
          index={undefined}
          validationErrors={validationErrors}
        />
      </div>
    );
  }

  // Otherwise, render input with drop zone
  return (
    <div ref={dropRef} className="relative inline-block">
      {renderInput()}
      {!slotValue && (
        <div className={cn(
          "absolute inset-0 pointer-events-none border-2 border-dashed rounded",
          isOverValue ? 'border-white/70 bg-white/10' : 'border-transparent'
        )} />
      )}
    </div>
  );
};

