import { BlockInstance } from '@/types/blocks';
import { buildVariableTypeMap, validateBlockTypes } from './typeInference';

export interface ValidationError {
  blockId: string;
  message: string;
  lineNumber?: number;
}

/**
 * Validates a block instance and returns validation errors if any
 */
export const validateBlock = (
  block: BlockInstance,
  lineNumber?: number,
  variableTypes?: Map<string, any>,
  depth: number = 0
): ValidationError | null => {
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
  
  // Check for standalone conditional blocks (must have parent or be in execution flow)
  if (['if', 'while', 'for'].includes(block.type) && depth === 0) {
    // These blocks are standalone at top level - this is actually valid in our system
    // But we could add a check if they need to be inside a function or event handler
    // For now, we'll allow them at top level
  }
  
  // Validate print block
  if (block.type === 'print') {
    const value = block.slots?.value;
    if (!value) {
      return {
        blockId: block.id,
        message: 'Print block requires a value',
        lineNumber,
      };
    }
    
    // If it's a string value, check if it's a variable that exists
    if (typeof value === 'string' && value.trim()) {
      const varName = value.trim();
      if (variableTypes && !variableTypes.has(varName)) {
        // Check if it's a literal (quoted string or number)
        const isLiteral = (varName.startsWith('"') && varName.endsWith('"')) ||
                         (varName.startsWith("'") && varName.endsWith("'")) ||
                         /^-?\d+$/.test(varName);
        if (!isLiteral) {
          return {
            blockId: block.id,
            message: `Variable "${varName}" used in print block does not exist`,
            lineNumber,
          };
        }
      }
    }
  }
  
  // Validate for loop limit
  if (block.type === 'for') {
    const limit = block.slots?.limit;
    if (!limit) {
      return {
        blockId: block.id,
        message: 'For loop requires a limit value',
        lineNumber,
      };
    }
    
    // If it's a string value, check if it's a variable that exists or a number
    if (typeof limit === 'string' && limit.trim()) {
      const limitValue = limit.trim();
      if (variableTypes && !variableTypes.has(limitValue)) {
        // Check if it's a number literal
        const isNumber = /^-?\d+$/.test(limitValue);
        if (!isNumber) {
          return {
            blockId: block.id,
            message: `Variable "${limitValue}" used in for loop limit does not exist or is not a number`,
            lineNumber,
          };
        }
      } else if (variableTypes && variableTypes.has(limitValue)) {
        // Check if the variable is an integer type
        const varType = variableTypes.get(limitValue);
        if (varType !== 'int') {
          return {
            blockId: block.id,
            message: `For loop limit must be an integer, but "${limitValue}" is of type ${varType}`,
            lineNumber,
          };
        }
      }
    }
  }
  
  // Type checking for operations
  if (variableTypes) {
    const typeValidation = validateBlockTypes(block, variableTypes);
    if (!typeValidation.isValid) {
      return {
        blockId: block.id,
        message: typeValidation.error || 'Type mismatch error',
        lineNumber,
      };
    }
  }
  
  // Recursively validate children
  if (block.children) {
    for (const child of block.children) {
      const error = validateBlock(child, undefined, variableTypes, depth + 1);
      if (error) return error;
    }
  }
  
  // Validate nested blocks in slots (like conditional blocks in condition slots)
  if (block.slots) {
    Object.values(block.slots).forEach(slotValue => {
      if (typeof slotValue === 'object' && 'type' in slotValue) {
        const error = validateBlock(slotValue as BlockInstance, undefined, variableTypes, depth + 1);
        if (error) return error;
      }
    });
  }
  
  return null;
};

/**
 * Validates all blocks and returns an array of validation errors
 */
export const validateBlocks = (blocks: BlockInstance[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  const variableTypes = buildVariableTypeMap(blocks);
  
  blocks.forEach((block, index) => {
    const error = validateBlock(block, index + 1, variableTypes, 0);
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

