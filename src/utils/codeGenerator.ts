import { BlockInstance, Language } from '@/types/blocks';
import { validateBlocks } from './validation';

export interface CodeGenerationResult {
  code: string;
  errorLines: number[];
}

export const generateCode = (blocks: BlockInstance[], language: Language): CodeGenerationResult => {
  const errorLines: number[] = [];
  
  if (blocks.length === 0) {
    const emptyCode = language === 'cpp' 
      ? '// Drag blocks to create your program\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
      : '# Drag blocks to create your program\n\n# Your code here';
    return { code: emptyCode, errorLines: [] };
  }
  
  // First pass: validate blocks and collect error block indices
  const validationErrors = validateBlocks(blocks);
  const errorBlockIds = new Set(validationErrors.map(e => e.blockId));
  
  // Second pass: generate code and track line numbers
  const codeLines: string[] = [];
  let currentLineNumber = language === 'cpp' ? 6 : 1; // C++ starts at line 6 (after header), Python at line 1
  
  blocks.forEach((block, index) => {
    const hasError = errorBlockIds.has(block.id);
    const blockCode = generateBlockCode(block, language, 0, hasError, false);
    
    if (hasError) {
      // For single-line blocks, mark the current line
      // For multi-line blocks, mark the first line
      errorLines.push(currentLineNumber);
    }
    
    // Count lines in this block's code
    const blockLines = blockCode.split('\n');
    codeLines.push(...blockLines);
    currentLineNumber += blockLines.length;
  });
  
  let code: string;
  if (language === 'cpp') {
    // Check if we need string header
    const hasStringVariable = blocks.some(block => block.type === 'string');
    const headers = hasStringVariable 
      ? '#include <iostream>\n#include <string>\nusing namespace std;'
      : '#include <iostream>\nusing namespace std;';
    code = `${headers}\n\nint main() {\n${codeLines.map(line => '    ' + line).join('\n')}\n    return 0;\n}`;
  } else {
    code = codeLines.join('\n');
  }
  
  return { code, errorLines };
};

const generateBlockCode = (block: BlockInstance, language: Language, indent: number = 0, hasError: boolean = false, isNested: boolean = false): string => {
  const indentation = '    '.repeat(indent);
  const slots = block.slots || {};
  
  switch (block.type) {
    case 'int':
      if (hasError) {
        const name = block.name?.trim() || '';
        const value = slots.value?.toString().trim() || '';
        const errorMsg = !name && !value 
          ? 'ERROR: Missing variable name and value'
          : !name 
          ? 'ERROR: Missing variable name'
          : 'ERROR: Missing variable value';
        return language === 'cpp'
          ? `${indentation}// ${errorMsg}`
          : `${indentation}# ${errorMsg}`;
      }
      const intValue = typeof slots.value === 'object' && 'type' in slots.value
        ? generateBlockCode(slots.value as BlockInstance, language, 0, false, true)
        : (slots.value || 0);
      return language === 'cpp' 
        ? `${indentation}int ${block.name || 'variable'} = ${intValue};`
        : `${indentation}${block.name || 'variable'} = ${intValue}`;
        
    case 'string':
      if (hasError) {
        const name = block.name?.trim() || '';
        const value = slots.value?.toString().trim() || '';
        const errorMsg = !name && !value 
          ? 'ERROR: Missing variable name and value'
          : !name 
          ? 'ERROR: Missing variable name'
          : 'ERROR: Missing variable value';
        return language === 'cpp'
          ? `${indentation}// ${errorMsg}`
          : `${indentation}# ${errorMsg}`;
      }
      const stringValue = typeof slots.value === 'object' && 'type' in slots.value
        ? generateBlockCode(slots.value as BlockInstance, language, 0, false, true)
        : (slots.value || '');
      return language === 'cpp'
        ? `${indentation}string ${block.name || 'text'} = "${stringValue}";`
        : `${indentation}${block.name || 'text'} = "${stringValue}"`;
        
    case 'bool':
      if (hasError) {
        const name = block.name?.trim() || '';
        const value = slots.value?.toString().trim() || '';
        const errorMsg = !name && !value 
          ? 'ERROR: Missing variable name and value'
          : !name 
          ? 'ERROR: Missing variable name'
          : 'ERROR: Missing variable value';
        return language === 'cpp'
          ? `${indentation}// ${errorMsg}`
          : `${indentation}# ${errorMsg}`;
      }
      const boolValue = typeof slots.value === 'object' && 'type' in slots.value
        ? generateBlockCode(slots.value as BlockInstance, language, 0, false, true)
        : (slots.value || 'false');
      return language === 'cpp'
        ? `${indentation}bool ${block.name || 'flag'} = ${boolValue};`
        : `${indentation}${block.name || 'flag'} = ${boolValue}`;
        
    case 'print':
      const printValue = typeof slots.value === 'object' && 'type' in slots.value
        ? generateBlockCode(slots.value as BlockInstance, language, 0, false, true)
        : (slots.value || '""');
      return language === 'cpp'
        ? `${indentation}cout << ${printValue} << endl;`
        : `${indentation}print(${printValue})`;
        
    case 'input':
      return language === 'cpp'
        ? `${indentation}cin >> ${slots.prompt || 'variable'};`
        : `${indentation}${slots.prompt || 'variable'} = input()`;
        
    case 'set':
      const varName = slots.variable || 'variable';
      const setValue = typeof slots.value === 'object' && 'type' in slots.value
        ? generateBlockCode(slots.value as BlockInstance, language, 0, false, true)
        : (slots.value || '0');
      return language === 'cpp'
        ? `${indentation}${varName} = ${setValue};`
        : `${indentation}${varName} = ${setValue}`;
        
    case 'if':
      const ifBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      const ifCondition = typeof slots.condition === 'object' && 'type' in slots.condition
        ? generateBlockCode(slots.condition as BlockInstance, language, 0, false, true)
        : (slots.condition || 'true');
      return language === 'cpp'
        ? `${indentation}if (${ifCondition}) {\n${ifBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}if ${ifCondition}:\n${ifBody || indentation + '    pass'}`;
        
    case 'while':
      const whileBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      const whileCondition = typeof slots.condition === 'object' && 'type' in slots.condition
        ? generateBlockCode(slots.condition as BlockInstance, language, 0, false, true)
        : (slots.condition || 'true');
      return language === 'cpp'
        ? `${indentation}while (${whileCondition}) {\n${whileBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}while ${whileCondition}:\n${whileBody || indentation + '    pass'}`;
        
    case 'for':
      const forBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      const forLimit = typeof slots.limit === 'object' && 'type' in slots.limit
        ? generateBlockCode(slots.limit as BlockInstance, language, 0, false, true)
        : (slots.limit || 10);
      return language === 'cpp'
        ? `${indentation}for (int i = 0; i < ${forLimit}; i++) {\n${forBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}for i in range(${forLimit}):\n${forBody || indentation + '    pass'}`;
        
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      const operators = { add: '+', subtract: '-', multiply: '*', divide: '/' };
      const leftOperand = typeof slots.left === 'object' && 'type' in slots.left
        ? generateBlockCode(slots.left as BlockInstance, language, 0, false, true)
        : (slots.left || 'a');
      const rightOperand = typeof slots.right === 'object' && 'type' in slots.right
        ? generateBlockCode(slots.right as BlockInstance, language, 0, false, true)
        : (slots.right || 'b');
      // Only add semicolon if not nested (i.e., when used as a standalone statement)
      const semicolon = isNested ? '' : ';'
      const returnValue = slots.left && slots.right ? `${indentation}${leftOperand} ${operators[block.type]} ${rightOperand}${semicolon}` 
      : `${(language === 'cpp'? '/*' : '#' )} ERROR: Missing operand ${language === 'cpp'? '*/': '' }`;
      return returnValue;
      
    case 'equals':
      const eqLeft = typeof slots.left === 'object' && 'type' in slots.left
        ? generateBlockCode(slots.left as BlockInstance, language, 0, false, true)
        : (slots.left || 'a');
      const eqRight = typeof slots.right === 'object' && 'type' in slots.right
        ? generateBlockCode(slots.right as BlockInstance, language, 0, false, true)
        : (slots.right || 'b');
        
      return `${eqLeft} == ${eqRight}`;
      
    case 'not-equals':
      const neLeft = typeof slots.left === 'object' && 'type' in slots.left
        ? generateBlockCode(slots.left as BlockInstance, language, 0, false, true)
        : (slots.left || 'a');
      const neRight = typeof slots.right === 'object' && 'type' in slots.right
        ? generateBlockCode(slots.right as BlockInstance, language, 0, false, true)
        : (slots.right || 'b');
      return `${neLeft} != ${neRight}`;
      
    case 'less-than':
      const ltLeft = typeof slots.left === 'object' && 'type' in slots.left
        ? generateBlockCode(slots.left as BlockInstance, language, 0, false, true)
        : (slots.left || 'a');
      const ltRight = typeof slots.right === 'object' && 'type' in slots.right
        ? generateBlockCode(slots.right as BlockInstance, language, 0, false, true)
        : (slots.right || 'b');
      return `${ltLeft} < ${ltRight}`;
      
    case 'greater-than':
      const gtLeft = typeof slots.left === 'object' && 'type' in slots.left
        ? generateBlockCode(slots.left as BlockInstance, language, 0, false, true)
        : (slots.left || 'a');
      const gtRight = typeof slots.right === 'object' && 'type' in slots.right
        ? generateBlockCode(slots.right as BlockInstance, language, 0, false, true)
        : (slots.right || 'b');
      return `${gtLeft} > ${gtRight}`;
      
    case 'comment':
      return language === 'cpp'
        ? `${indentation}// ${slots.text || 'Comment'}`
        : `${indentation}# ${slots.text || 'Comment'}`;
        
    default:
      return `${indentation}// Unknown block type`;
  }
};
