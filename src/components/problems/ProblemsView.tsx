import { useState } from 'react';
import { ChevronDown, ChevronRight, FileText, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { wordProblems, codeProblems, WordProblem, CodeProblem } from '@/data/problems';
import { WordProblemView } from './WordProblemView';
import { CodeProblemView } from './CodeProblemView';

type ProblemType = 'word' | 'code' | null;
type SelectedProblem = { type: ProblemType; id: string } | null;

export const ProblemsView = () => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['word', 'code']));
  const [selectedProblem, setSelectedProblem] = useState<SelectedProblem>(null);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleProblemClick = (type: 'word' | 'code', id: string) => {
    setSelectedProblem({ type, id });
  };

  return (
    <div className="h-full w-full flex flex-col bg-code-bg">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top sidebar - Problems list */}
        <div className="w-ful border-r border-border/20 overflow-auto flex-shrink-0">
          <div className="p-2 space-y-1">
            {/* Word Problems Section */}
            <div>
              <button
                onClick={() => toggleSection('word')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white hover:text-foreground hover:bg-muted rounded-md transition-colors"
              >
                {expandedSections.has('word') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>Word  Problems</span>
              </button>
              {expandedSections.has('word') && (
                <div className="ml-6 mt-1 space-y-1">
                  {wordProblems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemClick('word', problem.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:text-foreground hover:bg-muted rounded-md transition-colors",
                        selectedProblem?.type === 'word' && selectedProblem?.id === problem.id && "bg-muted text-foreground"
                      )}
                    >
                      <FileText className="w-3 h-3" />
                      <span>{problem.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Code Problems Section */}
            <div>
              <button
                onClick={() => toggleSection('code')}
                className="w-full flex items-center gap-2 px-3 py-2 hover:text-foreground text-sm font-semibold text-white hover:bg-muted rounded-md transition-colors"
              >
                {expandedSections.has('code') ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <span>Code Problems</span>
              </button>
              {expandedSections.has('code') && (
                <div className="ml-6 mt-1 space-y-1">
                  {codeProblems.map((problem) => (
                    <button
                      key={problem.id}
                      onClick={() => handleProblemClick('code', problem.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:text-foreground hover:bg-muted rounded-md transition-colors",
                        selectedProblem?.type === 'code' && selectedProblem?.id === problem.id && "bg-muted text-foreground"
                      )}
                    >
                      <Code className="w-3 h-3" />
                      <span>{problem.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom content area */}
        <div className="flex-1 overflow-auto">
          {selectedProblem ? (
            selectedProblem.type === 'word' ? (
              <WordProblemView
                problem={wordProblems.find((p) => p.id === selectedProblem.id)!}
              />
            ) : (
              <CodeProblemView
                problem={codeProblems.find((p) => p.id === selectedProblem.id)!}
              />
            )
          ) : (
            <div className="h-full flex items-center justify-center text-white">
              <p>Select a problem from the list to view it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

