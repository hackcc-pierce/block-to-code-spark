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
  
  switch (block.type) {
    case 'int':
      return language === 'cpp' 
        ? `${indentation}int variable = ${block.value || 0};`
        : `${indentation}variable = ${block.value || 0}`;
        
    case 'string':
      return language === 'cpp'
        ? `${indentation}string text = "${block.value || ''}";`
        : `${indentation}text = "${block.value || ''}"`;
        
    case 'bool':
      return language === 'cpp'
        ? `${indentation}bool flag = ${block.value || 'false'};`
        : `${indentation}flag = ${block.value || 'False'}`;
        
    case 'print':
      return language === 'cpp'
        ? `${indentation}cout << ${block.value || '""'} << endl;`
        : `${indentation}print(${block.value || '""'})`;
        
    case 'input':
      return language === 'cpp'
        ? `${indentation}cin >> variable;`
        : `${indentation}variable = input(${block.value || '""'})`;
        
    case 'if':
      const ifBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      return language === 'cpp'
        ? `${indentation}if (${block.value || 'true'}) {\n${ifBody}\n${indentation}}`
        : `${indentation}if ${block.value || 'True'}:\n${ifBody || indentation + '    pass'}`;
        
    case 'while':
      const whileBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      return language === 'cpp'
        ? `${indentation}while (${block.value || 'true'}) {\n${whileBody}\n${indentation}}`
        : `${indentation}while ${block.value || 'True'}:\n${whileBody || indentation + '    pass'}`;
        
    case 'for':
      const forBody = block.children?.map(child => generateBlockCode(child, language, indent + 1)).join('\n') || '';
      return language === 'cpp'
        ? `${indentation}for (int i = 0; i < ${block.value || 10}; i++) {\n${forBody}\n${indentation}}`
        : `${indentation}for i in range(${block.value || 10}):\n${forBody || indentation + '    pass'}`;
        
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      const operators = { add: '+', subtract: '-', multiply: '*', divide: '/' };
      return `${indentation}result = a ${operators[block.type]} b;`;
      
    case 'equals':
      return `condition == value`;
      
    case 'not-equals':
      return `condition != value`;
      
    case 'less-than':
      return `condition < value`;
      
    case 'greater-than':
      return `condition > value`;
      
    case 'comment':
      return language === 'cpp'
        ? `${indentation}// ${block.value || 'Comment'}`
        : `${indentation}# ${block.value || 'Comment'}`;
        
    default:
      return `${indentation}// Unknown block type`;
  }
};
