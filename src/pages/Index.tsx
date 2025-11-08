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

  const code = generateCode(blocks, language);

  const handleRun = () => {
    if (blocks.length === 0) {
      toast.error('No blocks to run! Add some blocks first.');
      return;
    }
    
    setTerminalOutput([
      'Program execution started...',
      '─'.repeat(40),
      ...blocks.map(block => {
        if (block.type === 'print') {
          return `Output: ${block.value}`;
        }
        return `Executed: ${block.type}`;
      }),
      '─'.repeat(40),
      'Program completed successfully ✓'
    ]);
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
            <Workspace blocks={blocks} onBlocksChange={setBlocks} />
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
