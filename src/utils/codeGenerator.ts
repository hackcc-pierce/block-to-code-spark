import { BlockInstance, Language } from '@/types/blocks';
import { validateBlock } from './validation';

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
  const errorBlockIndices = new Set<number>();
  blocks.forEach((block, index) => {
    const error = validateBlock(block);
    if (error) {
      errorBlockIndices.add(index);
    }
  });
  
  // Second pass: generate code and track line numbers
  const codeLines: string[] = [];
  let currentLineNumber = language === 'cpp' ? 6 : 1; // C++ starts at line 6 (after header), Python at line 1
  
  blocks.forEach((block, index) => {
    const hasError = errorBlockIndices.has(index);
    const blockCode = generateBlockCode(block, language, 0, hasError);
    
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
    code = `#include <iostream>\nusing namespace std;\n\nint main() {\n${codeLines.map(line => '    ' + line).join('\n')}\n    return 0;\n}`;
  } else {
    code = codeLines.join('\n');
  }
  
  return { code, errorLines };
};

const generateBlockCode = (block: BlockInstance, language: Language, indent: number = 0, hasError: boolean = false): string => {
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
      return language === 'cpp' 
        ? `${indentation}int ${block.name || 'variable'} = ${slots.value || 0};`
        : `${indentation}${block.name || 'variable'} = ${slots.value || 0}`;
        
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
      return language === 'cpp'
        ? `${indentation}string ${block.name || 'text'} = "${slots.value || ''}";`
        : `${indentation}${block.name || 'text'} = "${slots.value || ''}"`;
        
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
      return language === 'cpp'
        ? `${indentation}bool ${block.name || 'flag'} = ${slots.value || 'false'};`
        : `${indentation}${block.name || 'flag'} = ${slots.value || 'False'}`;
        
    case 'print':
      return language === 'cpp'
        ? `${indentation}cout << ${slots.value || '""'} << endl;`
        : `${indentation}print(${slots.value || '""'})`;
        
    case 'input':
      return language === 'cpp'
        ? `${indentation}cin >> ${slots.prompt || 'variable'};`
        : `${indentation}${slots.prompt || 'variable'} = input()`;
        
    case 'if':
      const ifBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      const ifCondition = typeof slots.condition === 'object' && 'type' in slots.condition
        ? generateBlockCode(slots.condition as BlockInstance, language, 0)
        : (slots.condition || 'true');
      return language === 'cpp'
        ? `${indentation}if (${ifCondition}) {\n${ifBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}if ${ifCondition}:\n${ifBody || indentation + '    pass'}`;
        
    case 'while':
      const whileBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      const whileCondition = typeof slots.condition === 'object' && 'type' in slots.condition
        ? generateBlockCode(slots.condition as BlockInstance, language, 0)
        : (slots.condition || 'true');
      return language === 'cpp'
        ? `${indentation}while (${whileCondition}) {\n${whileBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}while ${whileCondition}:\n${whileBody || indentation + '    pass'}`;
        
    case 'for':
      const forBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      return language === 'cpp'
        ? `${indentation}for (int i = 0; i < ${slots.limit || 10}; i++) {\n${forBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}for i in range(${slots.limit || 10}):\n${forBody || indentation + '    pass'}`;
        
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      const operators = { add: '+', subtract: '-', multiply: '*', divide: '/' };
      return `${indentation}result = ${slots.left || 'a'} ${operators[block.type]} ${slots.right || 'b'};`;
      
    case 'equals':
      return `${slots.left || 'a'} == ${slots.right || 'b'}`;
      
    case 'not-equals':
      return `${slots.left || 'a'} != ${slots.right || 'b'}`;
      
    case 'less-than':
      return `${slots.left || 'a'} < ${slots.right || 'b'}`;
      
    case 'greater-than':
      return `${slots.left || 'a'} > ${slots.right || 'b'}`;
      
    case 'comment':
      return language === 'cpp'
        ? `${indentation}// ${slots.text || 'Comment'}`
        : `${indentation}# ${slots.text || 'Comment'}`;
        
    default:
      return `${indentation}// Unknown block type`;
  }
};
