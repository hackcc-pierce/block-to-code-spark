import { useState } from 'react';
import { ChevronUp, ChevronDown, Terminal as TerminalIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  output: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const Terminal = ({ output, isExpanded, onToggle }: TerminalProps) => {
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
          {output.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium">
              {output.length}
            </span>
          )}
        </div>
        <button className="text-terminal-text/70 hover:text-terminal-text transition-colors">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="h-52 overflow-auto px-4 pb-4 font-mono text-sm">
          {output.length === 0 ? (
            <p className="text-terminal-text/50">Click "Run" to execute your program...</p>
          ) : (
            <div className="space-y-1">
              {output.map((line, idx) => (
                <div key={idx} className="text-terminal-text">
                  <span className="text-accent mr-2">{'>'}</span>
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
