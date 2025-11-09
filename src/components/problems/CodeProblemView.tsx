import { CodeProblem } from '@/data/problems';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeProblemViewProps {
  problem: CodeProblem;
}

export const CodeProblemView = ({ problem }: CodeProblemViewProps) => {
  const challengeComment = problem.language === 'cpp' 
    ? '// Challenge: try to recreate this code using blocks:'
    : '# Challenge: try to recreate this code using blocks:';

  const fullCode = `${challengeComment}\n\n${problem.codeSnippet}`;

  return (
    <div className="h-full flex flex-col bg-code-bg">
      <div className="flex-1 overflow-auto relative">
        <SyntaxHighlighter
          language={problem.language === 'cpp' ? 'cpp' : 'python'}
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
          {fullCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

