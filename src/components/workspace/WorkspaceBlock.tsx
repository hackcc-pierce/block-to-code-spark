import { useDrop, useDrag } from 'react-dnd';
import { BlockInstance } from '@/types/blocks';
import { blockDefinitions } from '@/utils/blockDefinitions';
import { v4 as uuidv4 } from 'uuid';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        name: ['int', 'string', 'bool'].includes(item.block.type) ? 'variable' : undefined,
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

  const renderSlotInput = (slotName: string) => {
    const slotValue = block.slots?.[slotName] || '';
    
    // For variable/value slots, show input or variable selector
    if (definition.slots?.find(s => s.name === slotName)?.type === 'value') {
      if (variables.length > 0) {
        return (
          <select
            value={String(slotValue)}
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
        value={String(slotValue)}
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
          isDragging && 'opacity-50'
        )}
      >
        {/* Variable name input for variable blocks */}
        {['int', 'string', 'bool'].includes(block.type) && (
          <>
            <span>{definition.label}</span>
            <input
              type="text"
              value={block.name || 'variable'}
              onChange={(e) => onUpdate(block.id, { name: e.target.value })}
              className="px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-sm outline-none focus:ring-2 focus:ring-white/50"
              placeholder="name"
            />
            <span>=</span>
            <input
              type={block.type === 'int' ? 'number' : 'text'}
              value={String(block.slots?.value || (block.type === 'int' ? '0' : block.type === 'bool' ? 'false' : ''))}
              onChange={(e) => {
                onUpdate(block.id, {
                  slots: { ...block.slots, value: e.target.value }
                });
              }}
              className="px-2 py-1 rounded bg-white/20 text-white border border-white/30 text-sm outline-none focus:ring-2 focus:ring-white/50"
              placeholder="value"
            />
          </>
        )}

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
            {renderSlotInput('left')}
            <span>{definition.label}</span>
            {renderSlotInput('right')}
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
            {renderSlotInput('limit')}
          </>
        )}

        {/* I/O blocks */}
        {block.type === 'print' && (
          <>
            <span>{definition.label}</span>
            {renderSlotInput('value')}
          </>
        )}

        {block.type === 'input' && (
          <>
            <span>{definition.label}</span>
            {renderSlotInput('prompt')}
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
