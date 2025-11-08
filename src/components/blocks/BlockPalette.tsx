import { blockDefinitions } from '@/utils/blockDefinitions';
import { Block } from './Block';
import { BlockCategory } from '@/types/blocks';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const categoryLabels: Record<BlockCategory, string> = {
  variable: 'Variables',
  conditional: 'Conditionals',
  arithmetic: 'Arithmetic',
  control: 'Control Flow',
  io: 'Input / Output',
  comment: 'Comments',
  function: 'Functions',
};

export const BlockPalette = () => {
  const [expandedCategories, setExpandedCategories] = useState<Set<BlockCategory>>(
    new Set(['variable', 'control', 'io'])
  );

  const toggleCategory = (category: BlockCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const categorizedBlocks = blockDefinitions.reduce((acc, block) => {
    if (!acc[block.category]) {
      acc[block.category] = [];
    }
    acc[block.category].push(block);
    return acc;
  }, {} as Record<BlockCategory, typeof blockDefinitions>);

  return (
    <div className="h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Block Palette</h2>
      </div>
      
      <div className="p-2 space-y-2">
        {Object.entries(categorizedBlocks).map(([category, blocks]) => (
          <div key={category} className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category as BlockCategory)}
              className="w-full px-3 py-2 flex items-center justify-between bg-muted hover:bg-muted/80 transition-colors"
            >
              <span className="font-medium text-sm text-foreground">
                {categoryLabels[category as BlockCategory]}
              </span>
              {expandedCategories.has(category as BlockCategory) ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedCategories.has(category as BlockCategory) && (
              <div className="p-2 space-y-2 bg-card">
                {blocks.map((block) => (
                  <Block key={block.id} block={block} isInPalette={true} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
