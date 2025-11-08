import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { BlockInstance, Language } from '@/types/blocks';
import { BlockPalette } from '@/components/blocks/BlockPalette';
import { Workspace } from '@/components/workspace/Workspace';
import { CodeView } from '@/components/code/CodeView';
import { Terminal } from '@/components/terminal/Terminal';
import { ControlBar } from '@/components/controls/ControlBar';
import { generateCode } from '@/utils/codeGenerator';
import { toast } from 'sonner';

const Index = () => {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [language, setLanguage] = useState<Language>('cpp');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);

  // Extract variable names from blocks
  const variables = blocks
    .filter(b => ['int', 'string', 'bool'].includes(b.type))
    .map(b => b.name || 'variable');

  const code = generateCode(blocks, language);

  const handleRun = () => {
    if (blocks.length === 0) {
      toast.error('No blocks to run! Add some blocks first.');
      return;
    }
    
    const output: string[] = ['Program execution started...', '─'.repeat(40)];
    
    const processBlock = (block: BlockInstance) => {
      if (block.type === 'print') {
        output.push(`Output: ${block.slots?.value || ''}`);
      } else {
        output.push(`Executed: ${block.type}`);
      }
      if (block.children) {
        block.children.forEach(processBlock);
      }
    };
    
    blocks.forEach(processBlock);
    output.push('─'.repeat(40), 'Program completed successfully ✓');
    
    setTerminalOutput(output);
    setIsTerminalExpanded(true);
    toast.success('Code executed successfully!');
  };

  const handleClear = () => {
    setBlocks([]);
    setTerminalOutput([]);
    toast.info('Workspace cleared');
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    toast.success(`Switched to ${newLang === 'cpp' ? 'C++' : 'Python'}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col overflow-hidden">
        <ControlBar
          language={language}
          onLanguageChange={handleLanguageChange}
          onRun={handleRun}
          onClear={handleClear}
        />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Block Palette - Left */}
          <div className="w-64 flex-shrink-0">
            <BlockPalette />
          </div>
          
          {/* Workspace - Center */}
          <div className="flex-1 min-w-0">
            <Workspace blocks={blocks} onBlocksChange={setBlocks} variables={variables} />
          </div>
          
          {/* Code View - Right */}
          <div className="w-96 flex-shrink-0 border-l border-border">
            <CodeView code={code} language={language} />
          </div>
        </div>
        
        {/* Terminal - Bottom */}
        <Terminal
          output={terminalOutput}
          isExpanded={isTerminalExpanded}
          onToggle={() => setIsTerminalExpanded(!isTerminalExpanded)}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
