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
import { hasValidationErrors } from '@/utils/validation';
import { codeExecutor } from '@/services/codeExecutor';
import { toast } from 'sonner';

const Index = () => {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [language, setLanguage] = useState<Language>('cpp');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Extract variable names from blocks
  const variables = blocks
    .filter(b => ['int', 'string', 'bool'].includes(b.type))
    .map(b => b.name || 'variable');

  const codeResult = generateCode(blocks, language);

  const handleRun = async () => {
    if (blocks.length === 0) {
      toast.error('No blocks to run! Add some blocks first.');
      return;
    }
    
    // Check for validation errors
    if (hasValidationErrors(blocks)) {
      toast.error('Cannot run code: Some variable blocks are missing required fields (name or value).');
      return;
    }
    
    setIsExecuting(true);
    setIsTerminalExpanded(true);
    setTerminalOutput(['🔄 Executing code...', '─'.repeat(50)]);
    
    try {
      const { code } = generateCode(blocks, language);
      
      // Execute the code using the code executor service
      const result = await codeExecutor.execute(code, language);
      
      const output: string[] = [];
      
      if (result.isCompilationError) {
        // Compilation error
        output.push('❌ Compilation Error', '─'.repeat(50));
        const errorLines = result.error ? result.error.split('\n') : ['Unknown compilation error'];
        output.push(...errorLines);
        output.push('─'.repeat(50));
        toast.error('Compilation failed');
      } else if (result.isRuntimeError || result.exitCode !== 0) {
        // Runtime error
        output.push('❌ Runtime Error', '─'.repeat(50));
        const errorLines = result.error ? result.error.split('\n') : ['Unknown runtime error'];
        output.push(...errorLines);
        if (result.output) {
          output.push('─'.repeat(50), 'Output before error:');
          output.push(...result.output.split('\n'));
        }
        output.push('─'.repeat(50));
        toast.error('Runtime error occurred');
      } else {
        // Success
        output.push('✅ Execution successful', '─'.repeat(50));
        
        // Split output into lines
        if (result.output && result.output !== '(no output)') {
          const outputLines = result.output.split('\n').filter(line => line.trim() !== '');
          if (outputLines.length > 0) {
            output.push(...outputLines);
          } else {
            output.push('(Program executed successfully with no output)');
          }
        } else {
          output.push('(Program executed successfully with no output)');
        }
        
        // Check if code contains input statements (warning)
        const code = generateCode(blocks, language).code;
        const hasInput = code.includes('input()') || code.includes('cin >>');
        if (hasInput) {
          output.push('─'.repeat(50));
          output.push('⚠️  Note: Input blocks require interactive execution and may not work with API-based execution.');
        }
        
        if (result.executionTime) {
          output.push('─'.repeat(50));
          output.push(`⏱️  Execution time: ${result.executionTime.toFixed(2)}ms`);
        }
        
        toast.success('Code executed successfully!');
      }
      
      setTerminalOutput(output);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setTerminalOutput([
        '❌ Execution Error',
        '─'.repeat(50),
        errorMessage,
        '─'.repeat(50),
        'Please check your code and try again.',
      ]);
      toast.error('Failed to execute code');
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleClearTerminal = () => {
    setTerminalOutput([]);
    toast.info('Terminal cleared');
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
          isExecuting={isExecuting}
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
            <CodeView code={codeResult.code} language={language} errorLines={codeResult.errorLines} />
          </div>
        </div>
        
        {/* Terminal - Bottom */}
        <Terminal
          output={terminalOutput}
          isExpanded={isTerminalExpanded}
          onToggle={() => setIsTerminalExpanded(!isTerminalExpanded)}
          onClear={handleClearTerminal}
          isExecuting={isExecuting}
        />
      </div>
    </DndProvider>
  );
};

export default Index;
