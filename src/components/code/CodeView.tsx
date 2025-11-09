import { useState } from 'react';
import { Language } from '@/types/blocks';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProblemsView } from '@/components/problems/ProblemsView';

interface CodeViewProps {
  code: string;
  language: Language;
  errorLines?: number[];
}

export const CodeView = ({ code, language, errorLines = [] }: CodeViewProps) => {
  const [activeTab, setActiveTab] = useState('live-code');

  return (
    <div className="h-full flex flex-col bg-code-bg">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-border/20">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="live-code">Live Code</TabsTrigger>
            <TabsTrigger value="problems">Problems</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="problems" className="flex-1 m-0 mt-0 data-[state=active]:flex">
          <ProblemsView />
        </TabsContent>

        <TabsContent value="live-code" className="flex-1 flex flex-col m-0 mt-0 overflow-hidden data-[state=active]:flex">
          <div className="px-4 py-2 border-b border-border/20 flex items-center justify-end">
            <div className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
              {language === 'cpp' ? 'C++' : 'Python'}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto relative">
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
              lineProps={(lineNumber) => {
                const isErrorLine = errorLines.includes(lineNumber);
                return isErrorLine ? {
                  style: {
                    display: 'block',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderLeft: '4px solid rgb(239, 68, 68)',
                    paddingLeft: '0.5rem',
                    marginLeft: '-0.5rem',
                  },
                } : {};
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </TabsContent>

        
      </Tabs>
    </div>
  );
};
