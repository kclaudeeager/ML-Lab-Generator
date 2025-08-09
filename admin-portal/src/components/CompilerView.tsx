import { useState } from 'react';
import { CompilationResult, CompilationDiagnostic } from '../services/types/simulation';
import CodeEditor from './common/CodeEditor';
import ActionButton from './common/ActionButton';
import DiagnosticsPanel from './common/DiagnosticsPanel';

interface CompilerViewProps {
  code: string;
  onChange: (code: string) => void;
  onCompilationComplete?: (result: CompilationResult) => void;
}

export default function CompilerView({ code, onChange, onCompilationComplete }: CompilerViewProps) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [diagnostics, setDiagnostics] = useState<CompilationDiagnostic[]>([]);
  const [compiledCode, setCompiledCode] = useState<string>('');

  const handleCompile = async () => {
    setIsCompiling(true);
    setDiagnostics([]);

    try {
      const response = await fetch('/api/compile_typescript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({
          typescript_code: code,
          target: 'ES2020',
          module: 'ES2020',
          strict: true
        })
      });

      if (!response.ok) {
        throw new Error('Compilation failed');
      }

      const result: CompilationResult = await response.json();
      setDiagnostics(result.diagnostics);
      setCompiledCode(result.compiled_code);
      onCompilationComplete?.(result);
    } catch (error) {
      setDiagnostics([{
        line: 0,
        column: 0,
        message: error instanceof Error ? error.message : 'Compilation failed',
        severity: 'error'
      }]);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">TypeScript Compiler</h2>
        <ActionButton
          variant="primary"
          loading={isCompiling}
          onClick={handleCompile}
        >
          {isCompiling ? 'Compiling...' : 'Compile'}
        </ActionButton>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-700">Source Code</h3>
          </div>
          <CodeEditor
            value={code}
            language="typescript"
            onChange={onChange}
            height="400px"
          />
        </div>

        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b">
            <h3 className="font-medium text-gray-700">Compiled JavaScript</h3>
          </div>
          <CodeEditor
            value={compiledCode}
            language="javascript"
            readOnly
            height="400px"
          />
        </div>
      </div>

      <DiagnosticsPanel diagnostics={diagnostics} />
    </div>
  );
}
