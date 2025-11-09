import { WordProblem } from '@/data/problems';

interface WordProblemViewProps {
  problem: WordProblem;
}

export const WordProblemView = ({ problem }: WordProblemViewProps) => {
  return (
    <div className="h-full p-6">
      <div className="bg-muted/50 rounded-lg p-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-foreground mb-4">{problem.title}</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {problem.description}
          </p>
        </div>
      </div>
    </div>
  );
};

