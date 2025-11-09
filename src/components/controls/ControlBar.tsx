import { Language } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ControlBarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onRun: () => void;
  onClear: () => void;
  isExecuting?: boolean;
}

export const ControlBar = ({ language, onLanguageChange, onRun, onClear, isExecuting = false }: ControlBarProps) => {
  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <a href="/">
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">BubbleCode</h1>
          </div>
        </div>
      </a>
      
      <div className="flex items-center gap-3">
        <Select 
          value={language} 
          onValueChange={(val) => onLanguageChange(val as Language)}
          disabled={isExecuting}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="gap-2"
          disabled={isExecuting}
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
        
        <Button
          size="sm"
          onClick={onRun}
          disabled={isExecuting}
          className="gap-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={cn("w-4 h-4", isExecuting && "animate-pulse")} />
          {isExecuting ? 'Running...' : 'Run'}
        </Button>
      </div>
    </div>
  );
};
