export interface WordProblem {
  id: string;
  title: string;
  description: string;
}

export interface CodeProblem {
  id: string;
  title: string;
  language: 'cpp' | 'python';
  codeSnippet: string;
}

export const wordProblems: WordProblem[] = [
  {
    id: 'wp1',
    title: 'WP 1',
    description: 'Example placeholder for a word problem. This is where you would describe a programming challenge that users need to solve using blocks.',
  },
  {
    id: 'wp2',
    title: 'WP 2',
    description: 'Another example placeholder. Word problems help learners understand real-world applications of programming concepts.',
  },
];

export const codeProblems: CodeProblem[] = [
  {
    id: 'cp1',
    title: 'CP 1',
    language: 'cpp',
    codeSnippet: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
  },
  {
    id: 'cp2',
    title: 'CP 2',
    language: 'python',
    codeSnippet: `print("Hello World")`,
  },
];

