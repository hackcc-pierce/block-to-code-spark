import { BlockInstance } from '@/types/blocks';

export interface ValidationError {
  blockId: string;
  message: string;
  lineNumber?: number;
}

/**
 * Validates a block instance and returns validation errors if any
 */
export const validateBlock = (block: BlockInstance, lineNumber?: number): ValidationError | null => {
  // Check variable blocks (int, string, bool)
  if (['int', 'string', 'bool'].includes(block.type)) {
    const name = block.name?.trim() || '';
    const value = block.slots?.value?.toString().trim() || '';
    
    if (!name && !value) {
      return {
        blockId: block.id,
        message: `Missing variable name and value`,
        lineNumber,
      };
    }
    
    if (!name) {
      return {
        blockId: block.id,
        message: `Missing variable name`,
        lineNumber,
      };
    }
    
    if (!value) {
      return {
        blockId: block.id,
        message: `Missing variable value`,
        lineNumber,
      };
    }
  }
  
  // Recursively validate children
  if (block.children) {
    for (const child of block.children) {
      const error = validateBlock(child);
      if (error) return error;
    }
  }
  
  return null;
};

/**
 * Validates all blocks and returns an array of validation errors
 */
export const validateBlocks = (blocks: BlockInstance[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  blocks.forEach((block, index) => {
    const error = validateBlock(block, index + 1);
    if (error) {
      errors.push(error);
    }
  });
  
  return errors;
};

/**
 * Checks if blocks have any validation errors
 */
export const hasValidationErrors = (blocks: BlockInstance[]): boolean => {
  return validateBlocks(blocks).length > 0;
};

