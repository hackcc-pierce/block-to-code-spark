import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputModalProps {
  isOpen: boolean;
  inputs: string[]; // Array of input prompts
  onSubmit: (values: string[]) => void;
  onCancel: () => void;
}

export const InputModal = ({ isOpen, inputs, onSubmit, onCancel }: InputModalProps) => {
  const [values, setValues] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setValues(new Array(inputs.length).fill(''));
    }
  }, [isOpen, inputs.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Program Input</h2>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Please provide the following inputs:
          </p>
          
          {inputs.map((prompt, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {prompt || `Input ${index + 1}`}:
              </label>
              <input
                type="text"
                value={values[index] || ''}
                onChange={(e) => handleChange(index, e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus={index === 0}
                placeholder={`Enter value for ${prompt || `input ${index + 1}`}`}
              />
            </div>
          ))}
          
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-md bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

