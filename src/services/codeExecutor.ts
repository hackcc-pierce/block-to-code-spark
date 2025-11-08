export interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime?: number;
  isCompilationError?: boolean;
  isRuntimeError?: boolean;
}

export interface CodeExecutor {
  execute(code: string, language: 'cpp' | 'python'): Promise<ExecutionResult>;
}

/**
 * Piston API executor - Free, open-source code execution API
 * No API key required
 * Uses EngineMC community instance: https://emkc.org
 */
class PistonExecutor implements CodeExecutor {
  private readonly API_URL = 'https://emkc.org/api/v2/piston/execute';
  
  async execute(code: string, language: 'cpp' | 'python'): Promise<ExecutionResult> {
    const languageMap = {
      cpp: {
        language: 'cpp',
        version: '*',
      },
      python: {
        language: 'python',
        version: '3.10',
      },
    };

    const lang = languageMap[language];

    try {
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: lang.language,
          version: lang.version,
          files: [
            {
              content: code,
            },
          ],
          stdin: '', // Add empty stdin field
        }),
      });

      // Read response body - clone response for error handling if needed
      let responseData: any;
      
      if (!response.ok) {
        // For error responses, try to get detailed error message
        let errorMessage = response.statusText;
        let errorDetails = '';
        
        // Clone response to read body without consuming it
        const clonedResponse = response.clone();
        try {
          const errorData = await clonedResponse.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          errorDetails = errorData.details ? ` Details: ${JSON.stringify(errorData.details)}` : '';
          if (errorData.language || errorData.version) {
            errorDetails += ` (Language: ${errorData.language || 'unknown'}, Version: ${errorData.version || 'unknown'})`;
          }
        } catch (jsonError) {
          // If not JSON, the error message is already set to statusText
          // We can't read the body again, so just use what we have
        }
        
        throw new Error(`Execution failed (${response.status}): ${errorMessage}${errorDetails}`);
      }

      // For successful responses, parse as JSON
      responseData = await response.json();

      // Piston API returns run output in data.run and compile output in data.compile
      const stdout = responseData.run?.stdout || '';
      const stderr = responseData.run?.stderr || '';
      const compileError = responseData.compile?.stderr || '';
      const exitCode = responseData.run?.code || 0;

      // Determine if it's a compilation or runtime error
      const isCompilationError = !!compileError;
      const isRuntimeError = exitCode !== 0 && !compileError && !!stderr;

      // Combine outputs - prioritize compilation errors, then runtime errors, then stdout
      let fullOutput = '';
      let errorMessage: string | undefined;

      if (compileError) {
        // Compilation error
        fullOutput = compileError;
        errorMessage = compileError;
      } else if (stderr && exitCode !== 0) {
        // Runtime error
        fullOutput = stderr;
        errorMessage = stderr;
      } else {
        // Normal output
        fullOutput = stdout;
      }

      // If we have both stdout and stderr but exit code is 0, combine them
      // (some programs write to stderr for warnings but still succeed)
      if (stdout && stderr && exitCode === 0 && !compileError) {
        fullOutput = `${stdout}${stderr ? '\n' + stderr : ''}`;
      }

      return {
        output: fullOutput.trim() || (exitCode === 0 ? '(no output)' : ''),
        error: errorMessage,
        exitCode: compileError ? 1 : exitCode,
        executionTime: responseData.run?.time ? parseFloat(responseData.run.time) * 1000 : undefined, // Convert to ms
        isCompilationError,
        isRuntimeError,
      };
    } catch (error) {
      // Better error handling - check if it's a network error or API error
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
}

// Export the default executor (Piston API)
export const codeExecutor: CodeExecutor = new PistonExecutor();

