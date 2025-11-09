import { useDrop, useDrag } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { blockDefinitions } from '@/utils/blockDefinitions';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ValueSlot } from './ValueSlot';

interface WorkspaceBlockProps {
  block: BlockInstance;
  index?: number;
  onUpdate: (blockId: string, updates: Partial<BlockInstance>) => void;
  onDelete: (blockId: string) => void;
  onAddChild: (parentId: string, childBlock: BlockInstance) => void;
  onMove?: (dragIndex: number, hoverIndex: number) => void;
  variables: string[];
  depth: number;
  totalBlocks?: number;
  validationErrors?: Map<string, string>; // Map of blockId to error message
}

const categoryColors: Record<string, string> = {
  variable: 'bg-block-variable',
  conditional: 'bg-block-conditional',
  arithmetic: 'bg-block-arithmetic',
  control: 'bg-block-control',
  io: 'bg-block-io',
  comment: 'bg-block-comment',
  function: 'bg-block-function',
};

export const WorkspaceBlock = ({
  block,
  index,
  onUpdate,
  onDelete,
  onAddChild,
  onMove,
  variables,
  depth,
  totalBlocks,
  validationErrors,
}: WorkspaceBlockProps) => {
  const definition = blockDefinitions.find((def) => def.type === block.type);
  if (!definition) return null;

  // Make blocks draggable only at top level (depth === 0)
  const isDraggable = depth === 0 && index !== undefined && onMove !== undefined;

  const [{ isDragging }, drag, preview] = useDrag(
    () => ({
      type: 'workspace-block',
      item: () => ({
        type: 'workspace-block',
        blockInstance: block,
        index,
      }),
      canDrag: () => isDraggable,
      end: (item, monitor) => {
        // Ensure drag ends properly
        if (!monitor.didDrop()) {
          // If not dropped on a valid drop target, the block stays in place
          // This is handled by the drop handlers
        }
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [block, index, isDraggable]
  );

  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: 'block',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;

      const newBlock: BlockInstance = {
        id: uuidv4(),
        type: item.block.type,
        category: item.block.category,
        name: ['int', 'string', 'bool'].includes(item.block.type) ? '' : undefined,
        slots: {},
        children: [],
      };

      onAddChild(block.id, newBlock);
    },
    canDrop: () => ['if', 'while', 'for'].includes(block.type),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }));

  const hasNesting = ['if', 'while', 'for'].includes(block.type);

  // Drop zone for condition slots to accept conditional blocks
  const [{ isOverCondition }, conditionDropRef] = useDrop(() => ({
    accept: 'block',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      
      // Only accept conditional blocks for condition slots
      if (item.block.category === 'conditional') {
        const newBlock: BlockInstance = {
          id: uuidv4(),
          type: item.block.type,
          category: item.block.category,
          slots: {},
          children: [],
        };
        
        onUpdate(block.id, {
          slots: { ...block.slots, condition: newBlock }
        });
      }
    },
    canDrop: (item: any) => {
      const slotDef = definition.slots?.find(s => s.name === 'condition');
      return slotDef?.type === 'condition' && item.block?.category === 'conditional';
    },
    collect: (monitor) => ({
      isOverCondition: monitor.isOver({ shallow: true }),
    }),
  }), [block.id, definition, onUpdate]);


  // Hybrid input component for arithmetic and conditional blocks
  const renderHybridInput = (slotName: string, slotValue: any) => {
    // Determine mode based on current value
    const currentValue = String(slotValue || '').trim();
    const isVariable = variables.includes(currentValue);
    const inputMode: 'variable' | 'constant' = isVariable ? 'variable' : 'constant';
    
    return (
      <div className="inline-flex items-center gap-1">
        <select
          value={inputMode}
          onChange={(e) => {
            const newMode = e.target.value as 'variable' | 'constant';
            if (newMode === 'variable' && variables.length > 0) {
              // Switch to variable mode - set to first variable if current value is not a variable
              if (!variables.includes(currentValue)) {
                onUpdate(block.id, {
                  slots: { ...block.slots, [slotName]: variables[0] }
                });
              }
            } else {
              // Switch to constant mode - clear if current value is a variable
              if (variables.includes(currentValue)) {
                onUpdate(block.id, {
                  slots: { ...block.slots, [slotName]: '' }
                });
              }
            }
          }}
          className="px-1 py-0.5 rounded bg-white/30 text-white border border-white/40 text-xs outline-none focus:ring-1 focus:ring-white/50"
        >
          <option value="variable">Var</option>
          <option value="constant">Const</option>
        </select>
        {inputMode === 'variable' && variables.length > 0 ? (
          <select
            value={currentValue}
            onChange={(e) => {
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: e.target.value }
              });
            }}
            className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="">--select--</option>
            {variables.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => {
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: e.target.value }
              });
            }}
            className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
            placeholder="value"
          />
        )}
      </div>
    );
  };

  const renderSlotInput = (slotName: string) => {
    const slotValue = block.slots?.[slotName];
    const slotDef = definition.slots?.find(s => s.name === slotName);
    
    // Handle condition slots - can contain BlockInstance or string
    if (slotDef?.type === 'condition') {
      // If slot contains a BlockInstance (conditional block), render it
      if (slotValue && typeof slotValue === 'object' && 'type' in slotValue) {
        const conditionalBlock = slotValue as BlockInstance;
        return (
          <div className="inline-flex items-center gap-1 relative group/condition">
            <WorkspaceBlock
              block={conditionalBlock}
              onUpdate={(blockId, updates) => {
                // Update the nested conditional block
                if (blockId === conditionalBlock.id) {
                  const updatedBlock = { ...conditionalBlock, ...updates };
                  onUpdate(block.id, {
                    slots: { ...block.slots, [slotName]: updatedBlock }
                  });
                }
              }}
              onDelete={() => {
                // Remove the conditional block from the slot
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
      
      // Otherwise, show drop zone or text input for constant
      return (
        <div ref={conditionDropRef} className="relative inline-block">
          <input
            type="text"
            value={typeof slotValue === 'string' ? slotValue : ''}
            onChange={(e) => {
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: e.target.value }
              });
            }}
            className={cn(
              "ml-1 px-2 py-1 rounded bg-white/20 text-white border text-xs outline-none focus:ring-2 focus:ring-white/50 min-w-[80px]",
              isOverCondition && 'ring-2 ring-white/50'
            )}
            placeholder="constant or drop == block"
          />
          {!slotValue && (
            <div className={cn(
              "absolute inset-0 pointer-events-none border-2 border-dashed rounded",
              isOverCondition ? 'border-white/70 bg-white/10' : 'border-transparent'
            )} />
          )}
        </div>
      );
    }
    
    // For variable/value slots, show input or variable selector
    if (slotDef?.type === 'value') {
      // For arithmetic and conditional blocks, use hybrid input (no drop zone needed)
      if (['add', 'subtract', 'multiply', 'divide', 'equals', 'not-equals', 'less-than', 'greater-than'].includes(block.type)) {
        return renderHybridInput(slotName, slotValue);
      }
      
      // For variable blocks (int, string, bool), allow arithmetic blocks in value slot
      if (['int', 'string', 'bool'].includes(block.type) && slotName === 'value') {
        return (
          <ValueSlot
            slotName={slotName}
            slotValue={slotValue}
            block={block}
            onUpdate={onUpdate}
            variables={variables}
            depth={depth}
            validationErrors={validationErrors}
            renderInput={() => (
              <input
                type={block.type === 'int' ? 'number' : 'text'}
                value={String(slotValue || '')}
                onChange={(e) => {
                  onUpdate(block.id, {
                    slots: { ...block.slots, [slotName]: e.target.value }
                  });
                }}
                className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50 min-w-[80px]"
                placeholder="value or drop + block"
              />
            )}
          />
        );
      }
      
      // For comment blocks, always use free text input
      if (block.type === 'comment') {
        return (
          <input
            type="text"
            value={String(slotValue || '')}
            onChange={(e) => {
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: e.target.value }
              });
            }}
            className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Enter comment text"
          />
        );
      }
      
      // For set block, variable slot should be dropdown, value slot should be hybrid
      if (block.type === 'set') {
        if (slotName === 'variable') {
          return (
            <select
              value={String(slotValue || '')}
              onChange={(e) => {
                onUpdate(block.id, {
                  slots: { ...block.slots, [slotName]: e.target.value }
                });
              }}
              className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="">--select variable--</option>
              {variables.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          );
        } else if (slotName === 'value') {
          return (
            <ValueSlot
              slotName={slotName}
              slotValue={slotValue}
              block={block}
              onUpdate={onUpdate}
              variables={variables}
              depth={depth}
              validationErrors={validationErrors}
              renderInput={() => renderHybridInput(slotName, slotValue)}
            />
          );
        }
      }
      
      if (variables.length > 0) {
        return (
          <select
            value={String(slotValue || '')}
            onChange={(e) => {
              onUpdate(block.id, {
                slots: { ...block.slots, [slotName]: e.target.value }
              });
            }}
            className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
          >
            <option value="">--value--</option>
            {variables.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        );
      }
    }
    
    return (
      <input
        type="text"
        value={String(slotValue || '')}
        onChange={(e) => {
          onUpdate(block.id, {
            slots: { ...block.slots, [slotName]: e.target.value }
          });
        }}
        className="ml-1 px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-xs outline-none focus:ring-2 focus:ring-white/50"
        placeholder={slotName}
      />
    );
  };

  return (
    <div className={cn("relative group", depth > 0 && "ml-8")}>
      <div
        ref={isDraggable ? drag : undefined}
        className={cn(
          'px-4 py-2.5 rounded-lg select-none transition-all duration-200 inline-flex items-center gap-2',
          categoryColors[block.category],
          'text-white font-medium text-sm',
          'block-shadow',
          isOver && 'ring-2 ring-white ring-inset',
          isDraggable && 'cursor-move',
          isDragging && 'opacity-50',
          // Add red border for invalid variable blocks
          ['int', 'string', 'bool'].includes(block.type) && 
          (!block.name?.trim() || !block.slots?.value?.toString().trim()) &&
          'ring-2 ring-red-400 ring-inset',
          // Add red border for validation errors
          validationErrors?.has(block.id) &&
          'ring-2 ring-red-400 ring-inset'
        )}
      >
        {/* Variable name input for variable blocks */}
        {['int', 'string', 'bool'].includes(block.type) && (() => {
          const name = block.name?.trim() || '';
          const value = block.slots?.value?.toString().trim() || '';
          const hasError = !name || !value;
          
          return (
            <>
              <span>{definition.label}</span>
              <input
                type="text"
                value={block.name || ''}
                onChange={(e) => onUpdate(block.id, { name: e.target.value })}
                className={cn(
                  "px-2 py-1 rounded bg-white/20 text-white border text-sm outline-none focus:ring-2",
                  hasError && !name
                    ? "border-red-400 focus:ring-red-400/50"
                    : "border-white/30 focus:ring-white/50"
                )}
                placeholder="name"
              />
              <span>=</span>
              <input
                type={block.type === 'int' ? 'number' : 'text'}
                value={String(block.slots?.value || '')}
                onChange={(e) => {
                  onUpdate(block.id, {
                    slots: { ...block.slots, value: e.target.value }
                  });
                }}
                className={cn(
                  "px-2 py-1 rounded bg-white/20 text-white border text-sm outline-none focus:ring-2",
                  hasError && !value
                    ? "border-red-400 focus:ring-red-400/50"
                    : "border-white/30 focus:ring-white/50"
                )}
                placeholder="value"
              />
            </>
          );
        })()}

        {/* Arithmetic operators */}
        {['add', 'subtract', 'multiply', 'divide'].includes(block.type) && (
          <>
            {renderSlotInput('left')}
            <span>{definition.label}</span>
            {renderSlotInput('right')}
          </>
        )}

        {/* Conditional operators */}
        {['equals', 'not-equals', 'less-than', 'greater-than'].includes(block.type) && (
          <>
            <ValueSlot
              slotName="left"
              slotValue={block.slots?.left}
              block={block}
              onUpdate={onUpdate}
              variables={variables}
              depth={depth}
              validationErrors={validationErrors}
              renderInput={() => renderHybridInput('left', block.slots?.left)}
            />
            <span>{definition.label}</span>
            <ValueSlot
              slotName="right"
              slotValue={block.slots?.right}
              block={block}
              onUpdate={onUpdate}
              variables={variables}
              depth={depth}
              validationErrors={validationErrors}
              renderInput={() => renderHybridInput('right', block.slots?.right)}
            />
          </>
        )}

        {/* Control structures */}
        {block.type === 'if' && (
          <>
            <span>if</span>
            {renderSlotInput('condition')}
          </>
        )}

        {block.type === 'while' && (
          <>
            <span>while</span>
            {renderSlotInput('condition')}
          </>
        )}

        {block.type === 'for' && (
          <>
            <span>for i = 0 to</span>
            <ValueSlot
              slotName="limit"
              slotValue={block.slots?.limit}
              block={block}
              onUpdate={onUpdate}
              variables={variables}
              depth={depth}
              validationErrors={validationErrors}
              renderInput={() => renderSlotInput('limit')}
            />
          </>
        )}

        {/* I/O blocks */}
        {block.type === 'print' && (
          <>
            <span>{definition.label}</span>
            <ValueSlot
              slotName="value"
              slotValue={block.slots?.value}
              block={block}
              onUpdate={onUpdate}
              variables={variables}
              depth={depth}
              validationErrors={validationErrors}
              renderInput={() => renderHybridInput('value', block.slots?.value)}
            />
          </>
        )}

        {block.type === 'input' && (
          <>
            <span>{definition.label}</span>
            {renderSlotInput('prompt')}
          </>
        )}

        {/* Set/Assignment block */}
        {block.type === 'set' && (
          <>
            <span>Set</span>
            {renderSlotInput('variable')}
            <span>to</span>
            {renderSlotInput('value')}
          </>
        )}

        {/* Comment */}
        {block.type === 'comment' && (
          <>
            <span>//</span>
            {renderSlotInput('text')}
          </>
        )}

        {/* Delete button */}
        <button
          onClick={() => onDelete(block.id)}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete block"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Nested blocks area */}
      {hasNesting && (
        <div
          ref={dropRef}
          className={cn(
            'ml-4 mt-2 pl-4 border-l-2 border-white/30 min-h-[40px]',
            isOver && 'border-white bg-white/5 rounded'
          )}
        >
          {block.children && block.children.length > 0 ? (
            <div className="space-y-2 py-2">
              {block.children.map((child) => (
                <WorkspaceBlock
                  key={child.id}
                  block={child}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  variables={variables}
                  depth={depth + 1}
                />
              ))}
            </div>
          ) : (
            <div className="text-white/40 text-xs py-2 italic">
              Drop blocks here
            </div>
          )}
        </div>
      )}
    </div>
  );
};
