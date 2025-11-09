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
  | 'set'
  | 'add'
  | 'subtract'
  | 'multiply'
  | 'divide'
  | 'equals'
  | 'not-equals'
  | 'less-than'
  | 'greater-than'
  | 'comment';

export type VariableType = 'int' | 'string' | 'bool' | 'unknown';

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
  name?: string; // For variables: the variable name
  slots?: { [key: string]: SlotValue }; // Values for each slot
  children?: BlockInstance[]; // Nested blocks (for control structures)
  parent?: string;
}

export type SlotValue = string | BlockInstance;

export type Language = 'cpp' | 'python';
