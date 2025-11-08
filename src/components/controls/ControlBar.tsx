import { Language } from '@/types/blocks';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Code2 } from 'lucide-react';
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
}

export const ControlBar = ({ language, onLanguageChange, onRun, onClear }: ControlBarProps) => {
  return (
    <div className="h-14 border-b border-border bg-card px-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">CodeBlocks Live</h1>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Select value={language} onValueChange={(val) => onLanguageChange(val as Language)}>
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
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </Button>
        
        <Button
          size="sm"
          onClick={onRun}
          className="gap-2 bg-accent hover:bg-accent/90"
        >
          <Play className="w-4 h-4" />
          Run
        </Button>
      </div>
    </div>
  );
};
