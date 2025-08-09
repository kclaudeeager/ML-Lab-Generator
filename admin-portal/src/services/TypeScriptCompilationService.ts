interface CompileOptions {
  target?: string;
  module?: string;
  strict?: boolean;
  include_source_map?: boolean;
}

interface CompilationResult {
  success: boolean;
  compiled_code: string;
  source_map?: string;
  diagnostics: Array<{
    line: number;
    column: number;
    message: string;
    severity: string;
  }>;
}

class TypeScriptCompilationService {
  private static readonly API_BASE = '/api';

  static async compileTypeScript(
    code: string, 
    options: CompileOptions = {}
  ): Promise<CompilationResult> {
    const response = await fetch(`${this.API_BASE}/compile_typescript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa('admin:admin'),
      },
      body: JSON.stringify({
        typescript_code: code,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`Compilation failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export type { CompileOptions, CompilationResult };
export default TypeScriptCompilationService;
