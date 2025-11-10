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
    description: 'Write a program that returns the first n numbers in the Fibonacci Sequence, where a user chooses n.',
  },
  {
    id: 'wp2',
    title: 'WP 2',
    description: 'Write a program that takes a user’s age and returns if they can drive, vote, drink, and/or run for president.',
  },
  {
    id: 'wp3',
    title: 'WP 3',
    description: 'Write a program that prints the menu for a restaurant, receives a user’s order, and prints their bill (including tax and tip!)',
  },
];

export const codeProblems: CodeProblem[] = [
  {
    id: 'cp1',
    title: 'CP 1',
    language: 'cpp',
    codeSnippet: `string userInput;
cout << “Launch Rocket? (Y/N) ”;
cin >> userInput;

if (userInput == “Y”) {
	for (int i = 10; i >= 0; i–) {
		cout << i << “!\n”;
	}
	cout << “Lift off!”;
}
else {
	cout << “Rocket launch cancelled.”;
}
`,
  },
  {
    id: 'cp2',
    title: 'CP 2',
    language: 'python',
    codeSnippet: `user_input = input(“Launch Rocket? (Y/N) “)

if user_input == “Y”:
	for i in range(10, 0, -1):
    		print(i)
else:
	print(“Rocket launch cancelled.”)
`,
  },
];

