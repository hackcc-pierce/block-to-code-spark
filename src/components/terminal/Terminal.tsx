import { ChevronUp, ChevronDown, Terminal as TerminalIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TerminalProps {
  output: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onClear?: () => void;
  isExecuting?: boolean;
}

export const Terminal = ({ output, isExpanded, onToggle, onClear, isExecuting = false }: TerminalProps) => {
  const getLineType = (line: string): 'error' | 'success' | 'info' | 'output' => {
    if (line.includes('❌') || line.includes('Error') || line.includes('error')) {
      return 'error';
    }
    if (line.includes('✅') || line.includes('successful')) {
      return 'success';
    }
    if (line.includes('🔄') || line.includes('⏱️') || line.includes('─')) {
      return 'info';
    }
    return 'output';
  };

  return (
    <div className={cn(
      "border-t border-border bg-terminal-bg transition-all duration-300",
      isExpanded ? "h-64" : "h-12"
    )}>
      <div 
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-terminal-bg/80 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-terminal-text" />
          <span className="text-sm font-semibold text-terminal-text">Terminal</span>
          {isExecuting && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-medium animate-pulse">
              Executing...
            </span>
          )}
          {!isExecuting && output.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
              {output.length} lines
            </span>
          )}
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isExpanded && output.length > 0 && onClear && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="h-7 px-2 text-terminal-text/70 hover:text-terminal-text hover:bg-terminal-bg/50"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          )}
          <button className="text-terminal-text/70 hover:text-terminal-text transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="h-52 overflow-auto px-4 pb-4 font-mono text-sm">
          {output.length === 0 && !isExecuting ? (
            <p className="text-terminal-text/50">Click "Run" to execute your program...</p>
          ) : (
            <div className="space-y-1">
              {output.map((line, idx) => {
                const lineType = getLineType(line);
                return (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex items-start",
                      lineType === 'error' && "text-red-400",
                      lineType === 'success' && "text-green-400",
                      lineType === 'info' && "text-terminal-text/70",
                      lineType === 'output' && "text-terminal-text"
                    )}
                  >
                    <span className={cn(
                      "mr-2 flex-shrink-0",
                      lineType === 'error' && "text-red-400",
                      lineType === 'success' && "text-green-400",
                      lineType === 'info' && "text-terminal-text/50",
                      lineType === 'output' && "text-accent"
                    )}>
                      {lineType === 'error' ? '✗' : lineType === 'success' ? '✓' : '>'}
                    </span>
                    <span className={cn(
                      lineType === 'error' && "font-semibold",
                      lineType === 'success' && "font-semibold"
                    )}>
                      {line}
                    </span>
                  </div>
                );
              })}
              {isExecuting && (
                <div className="text-terminal-text/50 animate-pulse flex items-center">
                  <span className="mr-2">⏳</span>
                  <span>Executing...</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
