import { Language } from '@/types/blocks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewProps {
  code: string;
  language: Language;
}

export const CodeView = ({ code, language }: CodeViewProps) => {
  return (
    <div className="h-full flex flex-col bg-code-bg">
      <div className="px-4 py-3 border-b border-border/20 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-code-text">Live Code</h2>
        <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
          {language === 'cpp' ? 'C++' : 'Python'}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language === 'cpp' ? 'cpp' : 'python'}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '13px',
            lineHeight: '1.6',
          }}
          codeTagProps={{
            style: {
              fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};
