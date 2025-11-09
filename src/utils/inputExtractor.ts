import { BlockInstance } from '@/types/blocks';

/**
 * Recursively extracts all input blocks and their prompts from the block structure
 */
export const extractInputBlocks = (blocks: BlockInstance[]): string[] => {
  const inputs: string[] = [];
  
  const processBlock = (block: BlockInstance) => {
    if (block.type === 'input') {
      const prompt = block.slots?.prompt?.toString().trim() || '';
      inputs.push(prompt || 'Enter value');
    }
    
    // Process nested blocks
    if (block.children) {
      block.children.forEach(processBlock);
    }
    
    // Process nested blocks in slots
    if (block.slots) {
      Object.values(block.slots).forEach(slotValue => {
        if (typeof slotValue === 'object' && 'type' in slotValue) {
          processBlock(slotValue as BlockInstance);
        }
      });
    }
  };
  
  blocks.forEach(processBlock);
  return inputs;
};

