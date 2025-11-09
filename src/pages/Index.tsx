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
import { hasValidationErrors, validateBlocks } from '@/utils/validation';
import { codeExecutor } from '@/services/codeExecutor';
import { extractInputBlocks } from '@/utils/inputExtractor';
import { InputModal } from '@/components/modals/InputModal';
import { toast } from 'sonner';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Index = () => {
  const [blocks, setBlocks] = useState<BlockInstance[]>([]);
  const [language, setLanguage] = useState<Language>('cpp');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [pendingInputs, setPendingInputs] = useState<string[]>([]);
  const [pendingExecution, setPendingExecution] = useState<{ code: string; language: Language } | null>(null);

  // Extract variable names from blocks
  const variables = blocks
    .filter(b => ['int', 'string', 'bool'].includes(b.type))
    .map(b => b.name || 'variable');

  const codeResult = generateCode(blocks, language);
  
  // Build validation errors map
  const validationErrorsMap = new Map<string, string>();
  const validationErrors = validateBlocks(blocks);
  validationErrors.forEach(error => {
    validationErrorsMap.set(error.blockId, error.message);
  });

  const executeCode = async (code: string, stdin: string = '') => {
    setIsExecuting(true);
    setIsTerminalExpanded(true);
    setTerminalOutput(['🔄 Executing code...', '─'.repeat(50)]);
    
    try {
      // Execute the code using the code executor service
      const result = await codeExecutor.execute(code, language, stdin);
      
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
    
    const { code } = generateCode(blocks, language);
    
    // Detect input blocks
    const inputPrompts = extractInputBlocks(blocks);
    
    if (inputPrompts.length > 0) {
      // Show input modal
      setPendingInputs(inputPrompts);
      setPendingExecution({ code, language });
      setIsInputModalOpen(true);
    } else {
      // Execute directly without inputs
      await executeCode(code);
    }
  };

  const handleInputSubmit = async (values: string[]) => {
    setIsInputModalOpen(false);
    const stdin = values.join('\n');
    
    if (pendingExecution) {
      await executeCode(pendingExecution.code, stdin);
      setPendingExecution(null);
      setPendingInputs([]);
    }
  };

  const handleInputCancel = () => {
    setIsInputModalOpen(false);
    setPendingExecution(null);
    setPendingInputs([]);
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
          
          {/* Workspace and Code View - Resizable */}
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={70} minSize={30} className="min-w-0">
              <Workspace blocks={blocks} onBlocksChange={setBlocks} variables={variables} validationErrors={validationErrorsMap} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20} className="min-w-0 border-l border-border">
              <CodeView code={codeResult.code} language={language} errorLines={codeResult.errorLines} />
            </ResizablePanel>
          </ResizablePanelGroup>
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
      
      {/* Input Modal */}
      <InputModal
        isOpen={isInputModalOpen}
        inputs={pendingInputs}
        onSubmit={handleInputSubmit}
        onCancel={handleInputCancel}
      />
    </DndProvider>
  );
};

export default Index;
