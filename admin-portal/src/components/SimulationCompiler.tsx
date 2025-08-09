import React, { useState } from 'react';
import CodeEditor from './common/CodeEditor';
import DiagnosticsPanel from './common/DiagnosticsPanel';
import ActionButton from './common/ActionButton';
import { CompilationResult } from '../services/types/simulation';

interface SimulationCompilerProps {
  initialCode: string;
  onCompiled?: (result: CompilationResult) => void;
}

export default function SimulationCompiler({ initialCode, onCompiled }: SimulationCompilerProps) {
  const [sourceCode, setSourceCode] = useState(initialCode);
  const [compiledCode, setCompiledCode] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [diagnostics, setDiagnostics] = useState<CompilationResult['diagnostics']>([]);

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
          typescript_code: sourceCode,
          target: 'ES2020',
          module: 'ES2020',
          strict: true
        })
      });

      if (!response.ok) {
        throw new Error('Compilation failed');
      }

      const result: CompilationResult = await response.json();
      setCompiledCode(result.compiled_code);
      setDiagnostics(result.diagnostics);
      onCompiled?.(result);
    } catch (error) {
      setDiagnostics([{
        line: 0,
        column: 0,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        severity: 'error'
      }]);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Simulation Compiler</h2>
        <ActionButton
          variant="primary"
          loading={isCompiling}
          onClick={handleCompile}
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          }
        >
          {isCompiling ? 'Compiling...' : 'Compile'}
        </ActionButton>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">TypeScript Source</label>
          <div className="border rounded-lg overflow-hidden">
            <CodeEditor
              value={sourceCode}
              language="typescript"
              onChange={setSourceCode}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Compiled JavaScript</label>
          <div className="border rounded-lg overflow-hidden">
            <CodeEditor
              value={compiledCode}
              language="javascript"
              readOnly
            />
          </div>
        </div>
      </div>

      <DiagnosticsPanel diagnostics={diagnostics} />
    </div>
  );
}
