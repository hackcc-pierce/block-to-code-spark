export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime?: number;
  isCompilationError?: boolean;
  isRuntimeError?: boolean;
}

export interface CodeExecutor {
  execute(code: string, language: 'cpp' | 'python', stdin?: string): Promise<ExecutionResult>;
}

/**
 * Judge0 CE API executor
 * API endpoint: https://judge0-ce.p.rapidapi.com/submissions
 * Language IDs: C++ (54), Python (71)
 */
class Judge0Executor implements CodeExecutor {
  private readonly API_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
  private readonly API_KEY = import.meta.env.VITE_JUDGE0_API_KEY || '';
  
  private readonly LANGUAGE_IDS = {
    cpp: 54,
    python: 71,
  };
  
  async execute(code: string, language: 'cpp' | 'python', stdin: string = ''): Promise<ExecutionResult> {
    const languageId = this.LANGUAGE_IDS[language];
    
    if (!this.API_KEY) {
      return {
        output: '',
        error: 'Judge0 API key not configured. Please set VITE_JUDGE0_API_KEY environment variable.',
        exitCode: 1,
        isCompilationError: false,
        isRuntimeError: false,
      };
    }

    try {
      // Step 1: Submit code
      const submitResponse = await fetch(`${this.API_URL}?base64_encoded=false&wait=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': this.API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        body: JSON.stringify({
          source_code: code,
          language_id: languageId,
          stdin: stdin,
        }),
      });

      if (!submitResponse.ok) {
        const errorData = await submitResponse.json().catch(() => ({}));
        throw new Error(`Submission failed (${submitResponse.status}): ${errorData.message || submitResponse.statusText}`);
      }

      const submission = await submitResponse.json();
      const token = submission.token;

      if (!token) {
        throw new Error('No token received from Judge0 API');
      }

      // Step 2: Poll for results
      const result = await this.pollForResult(token);
      
      return this.formatResult(result);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          output: '',
          error: 'Network error: Could not connect to code execution service. Please check your internet connection.',
          exitCode: 1,
          isCompilationError: false,
          isRuntimeError: false,
        };
      }
      
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        exitCode: 1,
        isCompilationError: false,
        isRuntimeError: false,
      };
    }
  }

  private async pollForResult(token: string, maxAttempts: number = 30): Promise<any> {
    const pollUrl = `${this.API_URL}/${token}?base64_encoded=false`;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between polls
      
      const response = await fetch(pollUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to poll result (${response.status})`);
      }

      const result = await response.json();
      
      // Status 1 = In Queue, Status 2 = Processing
      // Status 3 = Accepted (completed)
      if (result.status?.id === 3) {
        return result;
      }
      
      // Status 4-15 are various error states
      if (result.status?.id && result.status.id >= 4) {
        return result;
      }
    }
    
    throw new Error('Execution timeout: Result not available after maximum polling attempts');
  }

  private formatResult(result: any): ExecutionResult {
    const statusId = result.status?.id;
    const statusDescription = result.status?.description || 'Unknown';
    
    // Status IDs:
    // 3 = Accepted (success)
    // 4-15 = Various errors
    const isSuccess = statusId === 3;
    
    // Determine error type
    const isCompilationError = statusId === 6 || statusId === 7 || statusId === 8; // Compile Error, Runtime Error (NZEC), Runtime Error (Other)
    const isRuntimeError = statusId === 4 || statusId === 5 || (statusId >= 9 && statusId <= 15);
    
    const stdout = result.stdout || '';
    const stderr = result.stderr || '';
    const compileOutput = result.compile_output || '';
    const message = result.message || '';
    
    // Combine error messages
    let errorMessage: string | undefined;
    let fullOutput = '';
    
    if (compileOutput) {
      errorMessage = compileOutput;
      fullOutput = compileOutput;
    } else if (stderr) {
      errorMessage = stderr;
      fullOutput = stderr;
    } else if (message) {
      errorMessage = message;
      fullOutput = message;
    } else if (!isSuccess) {
      errorMessage = statusDescription;
      fullOutput = statusDescription;
    } else {
      fullOutput = stdout;
    }
    
    // If we have both stdout and stderr but it's a success, combine them
    if (stdout && stderr && isSuccess) {
      fullOutput = `${stdout}${stderr ? '\n' + stderr : ''}`;
    }
    
    return {
      output: fullOutput.trim() || (isSuccess ? '(no output)' : ''),
      error: errorMessage,
      exitCode: isSuccess ? 0 : 1,
      executionTime: result.time ? parseFloat(result.time) * 1000 : undefined, // Convert to ms
      isCompilationError,
      isRuntimeError,
    };
  }
}

// Export the default executor (Judge0 API)
export const codeExecutor: CodeExecutor = new Judge0Executor();
