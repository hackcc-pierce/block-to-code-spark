import { useDrag } from 'react-dnd';
import { BlockDefinition, BlockCategory } from '@/types/blocks';
import { cn } from '@/lib/utils';

interface BlockProps {
  block: BlockDefinition;
  isInPalette?: boolean;
}

const categoryColors: Record<BlockCategory, string> = {
  variable: 'bg-block-variable',
  conditional: 'bg-block-conditional',
  arithmetic: 'bg-block-arithmetic',
  control: 'bg-block-control',
  io: 'bg-block-io',
  comment: 'bg-block-comment',
  function: 'bg-block-function',
};

export const Block = ({ block, isInPalette = true }: BlockProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { block },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={cn(
        'px-4 py-2.5 rounded-lg cursor-move select-none transition-all duration-200',
        categoryColors[block.category],
        'text-white font-medium text-sm',
        'block-shadow hover:block-shadow-hover',
        'hover:scale-105 active:scale-95',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2">
        <span>{block.label}</span>
        {block.slots && block.slots.length > 0 && (
          <div className="flex gap-1">
            {block.slots.map((slot, idx) => (
              <div
                key={idx}
                className="w-3 h-3 rounded-full bg-white/30 border border-white/50"
                title={slot.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
