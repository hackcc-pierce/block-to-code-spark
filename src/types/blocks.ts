export type BlockCategory = 
  | 'variable' 
  | 'conditional' 
  | 'arithmetic' 
  | 'control' 
  | 'io' 
  | 'comment' 
  | 'function';

export type BlockType = 
  | 'int'
  | 'string'
  | 'bool'
  | 'if'
  | 'else'
  | 'while'
  | 'for'
  | 'print'
  | 'input'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'equals'
  | 'not-equals'
  | 'less-than'
  | 'greater-than'
  | 'comment';

export interface BlockDefinition {
  id: string;
  type: BlockType;
  category: BlockCategory;
  label: string;
  icon?: string;
  slots?: {
    name: string;
    type: 'value' | 'condition' | 'statement';
  }[];
}

export interface BlockInstance {
  id: string;
  type: BlockType;
  category: BlockCategory;
  x: number;
  y: number;
  children?: BlockInstance[];
  value?: string | number | boolean;
  parent?: string;
}

export type Language = 'cpp' | 'python';
