import { BlockDefinition } from '@/types/blocks';

export const blockDefinitions: BlockDefinition[] = [
  // Variables
  {
    id: 'int',
    type: 'int',
    category: 'variable',
    label: 'int variable',
    slots: [{ name: 'value', type: 'value' }]
  },
  {
    id: 'string',
    type: 'string',
    category: 'variable',
    label: 'string variable',
    slots: [{ name: 'value', type: 'value' }]
  },
  {
    id: 'bool',
    type: 'bool',
    category: 'variable',
    label: 'bool variable',
    slots: [{ name: 'value', type: 'value' }]
  },
  
  // Control Flow
  {
    id: 'if',
    type: 'if',
    category: 'control',
    label: 'if',
    slots: [
      { name: 'condition', type: 'condition' },
      { name: 'body', type: 'statement' }
    ]
  },
  {
    id: 'while',
    type: 'while',
    category: 'control',
    label: 'while',
    slots: [
      { name: 'condition', type: 'condition' },
      { name: 'body', type: 'statement' }
    ]
  },
  {
    id: 'for',
    type: 'for',
    category: 'control',
    label: 'for loop',
    slots: [
      { name: 'init', type: 'statement' },
      { name: 'condition', type: 'condition' },
      { name: 'increment', type: 'statement' },
      { name: 'body', type: 'statement' }
    ]
  },
  
  // I/O
  {
    id: 'print',
    type: 'print',
    category: 'io',
    label: 'print',
    slots: [{ name: 'value', type: 'value' }]
  },
  {
    id: 'input',
    type: 'input',
    category: 'io',
    label: 'input',
    slots: [{ name: 'prompt', type: 'value' }]
  },
  
  // Conditionals
  {
    id: 'equals',
    type: 'equals',
    category: 'conditional',
    label: '==',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'not-equals',
    type: 'not-equals',
    category: 'conditional',
    label: '!=',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'less-than',
    type: 'less-than',
    category: 'conditional',
    label: '<',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'greater-than',
    type: 'greater-than',
    category: 'conditional',
    label: '>',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  
  // Arithmetic
  {
    id: 'add',
    type: 'add',
    category: 'arithmetic',
    label: '+',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'subtract',
    type: 'subtract',
    category: 'arithmetic',
    label: '-',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'multiply',
    type: 'multiply',
    category: 'arithmetic',
    label: '*',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  {
    id: 'divide',
    type: 'divide',
    category: 'arithmetic',
    label: '/',
    slots: [
      { name: 'left', type: 'value' },
      { name: 'right', type: 'value' }
    ]
  },
  
  // Comment
  {
    id: 'comment',
    type: 'comment',
    category: 'comment',
    label: '// comment',
    slots: [{ name: 'text', type: 'value' }]
  }
];
