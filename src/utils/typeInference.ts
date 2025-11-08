import { BlockInstance, VariableType } from '@/types/blocks';

/**
 * Infers the type of a value (variable name or literal)
 */
export const inferValueType = (
  value: string | BlockInstance | undefined,
  variableTypes: Map<string, VariableType>
): VariableType => {
  if (!value) return 'unknown';
  
  // If it's a BlockInstance, it's a nested expression - we'd need to evaluate it
  // For now, return unknown for nested expressions
  if (typeof value === 'object' && 'type' in value) {
    return 'unknown';
  }
  
  const strValue = String(value).trim();
  
  // Check if it's a variable name
  if (variableTypes.has(strValue)) {
    return variableTypes.get(strValue)!;
  }
  
  // Check if it's a boolean literal
  if (strValue === 'true' || strValue === 'false' || strValue === 'True' || strValue === 'False') {
    return 'bool';
  }
  
  // Check if it's a number literal
  if (/^-?\d+$/.test(strValue)) {
    return 'int';
  }
  
  // Check if it's a string literal (quoted)
  if ((strValue.startsWith('"') && strValue.endsWith('"')) ||
      (strValue.startsWith("'") && strValue.endsWith("'"))) {
    return 'string';
  }
  
  // Default to unknown
  return 'unknown';
};

/**
 * Builds a map of variable names to their types from blocks
 */
export const buildVariableTypeMap = (blocks: BlockInstance[]): Map<string, VariableType> => {
  const typeMap = new Map<string, VariableType>();
  
  const processBlock = (block: BlockInstance) => {
    if (['int', 'string', 'bool'].includes(block.type)) {
      const varName = block.name?.trim();
      if (varName) {
        typeMap.set(varName, block.type as VariableType);
      }
    }
    
    // Process nested blocks
    if (block.children) {
      block.children.forEach(processBlock);
    }
    
    // Process condition slots that might contain nested blocks
    if (block.slots) {
      Object.values(block.slots).forEach(slotValue => {
        if (typeof slotValue === 'object' && 'type' in slotValue) {
          processBlock(slotValue as BlockInstance);
        }
      });
    }
  };
  
  blocks.forEach(processBlock);
  return typeMap;
};

/**
 * Checks if two types are compatible for arithmetic operations
 */
export const areTypesCompatibleForArithmetic = (left: VariableType, right: VariableType): boolean => {
  // Arithmetic operations only work with numbers
  return left === 'int' && right === 'int';
};

/**
 * Checks if two types are compatible for comparison operations
 */
export const areTypesCompatibleForComparison = (left: VariableType, right: VariableType): boolean => {
  // Comparisons work with same types, or int with int
  if (left === 'unknown' || right === 'unknown') {
    return false; // Can't compare unknown types
  }
  
  // Same types are always comparable
  if (left === right) {
    return true;
  }
  
  // Numbers can be compared
  if (left === 'int' && right === 'int') {
    return true;
  }
  
  // Otherwise, incompatible
  return false;
};

/**
 * Validates type compatibility for a block operation
 */
export const validateBlockTypes = (
  block: BlockInstance,
  variableTypes: Map<string, VariableType>
): { isValid: boolean; error?: string } => {
  const slots = block.slots || {};
  
  // Arithmetic operations
  if (['add', 'subtract', 'multiply', 'divide'].includes(block.type)) {
    const leftType = inferValueType(slots.left, variableTypes);
    const rightType = inferValueType(slots.right, variableTypes);
    
    if (!areTypesCompatibleForArithmetic(leftType, rightType)) {
      return {
        isValid: false,
        error: `Type mismatch: Cannot perform ${block.type} operation between ${leftType} and ${rightType}. Both operands must be integers.`
      };
    }
  }
  
  // Comparison operations
  if (['equals', 'not-equals', 'less-than', 'greater-than'].includes(block.type)) {
    const leftType = inferValueType(slots.left, variableTypes);
    const rightType = inferValueType(slots.right, variableTypes);
    
    if (!areTypesCompatibleForComparison(leftType, rightType)) {
      return {
        isValid: false,
        error: `Type mismatch: Cannot compare ${leftType} with ${rightType}. Types must be compatible.`
      };
    }
  }
  
  // Set/assignment operation
  if (block.type === 'set') {
    const varName = String(slots.variable || '').trim();
    if (varName && variableTypes.has(varName)) {
      const varType = variableTypes.get(varName)!;
      const valueType = inferValueType(slots.value, variableTypes);
      
      if (varType !== valueType && valueType !== 'unknown') {
        return {
          isValid: false,
          error: `Type mismatch: Cannot assign ${valueType} to variable "${varName}" of type ${varType}.`
        };
      }
    }
  }
  
  return { isValid: true };
};

