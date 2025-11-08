import { BlockInstance, Language } from '@/types/blocks';

export const generateCode = (blocks: BlockInstance[], language: Language): string => {
  if (blocks.length === 0) {
    return language === 'cpp' 
      ? '// Drag blocks to create your program\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}'
      : '# Drag blocks to create your program\n\n# Your code here';
  }
  
  const codeLines = blocks.map(block => generateBlockCode(block, language, 0));
  
  if (language === 'cpp') {
    return `#include <iostream>\nusing namespace std;\n\nint main() {\n${codeLines.map(line => '    ' + line).join('\n')}\n    return 0;\n}`;
  } else {
    return codeLines.join('\n');
  }
};

const generateBlockCode = (block: BlockInstance, language: Language, indent: number = 0): string => {
  const indentation = '    '.repeat(indent);
  const slots = block.slots || {};
  
  switch (block.type) {
    case 'int':
      return language === 'cpp' 
        ? `${indentation}int ${block.name || 'variable'} = ${slots.value || 0};`
        : `${indentation}${block.name || 'variable'} = ${slots.value || 0}`;
        
    case 'string':
      return language === 'cpp'
        ? `${indentation}string ${block.name || 'text'} = "${slots.value || ''}";`
        : `${indentation}${block.name || 'text'} = "${slots.value || ''}"`;
        
    case 'bool':
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
      return language === 'cpp'
        ? `${indentation}if (${slots.condition || 'true'}) {\n${ifBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}if ${slots.condition || 'True'}:\n${ifBody || indentation + '    pass'}`;
        
    case 'while':
      const whileBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      return language === 'cpp'
        ? `${indentation}while (${slots.condition || 'true'}) {\n${whileBody || indentation + '    // empty'}\n${indentation}}`
        : `${indentation}while ${slots.condition || 'True'}:\n${whileBody || indentation + '    pass'}`;
        
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
