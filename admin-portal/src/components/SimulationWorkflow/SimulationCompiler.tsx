import React, { useState } from 'react';
import CodeEditor from '../common/CodeEditor';
import { CompilationResult } from '../../services/types/simulation';
import ActionButton from '../common/ActionButton';

interface SimulationCompilerProps {
  initialCode: string;
  onCompiled: (result: CompilationResult) => void;
}

export default function SimulationCompiler({ initialCode, onCompiled }: SimulationCompilerProps) {
  const [code, setCode] = useState(initialCode);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompile = async () => {
    setIsCompiling(true);
    setError(null);

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
      
      if (result.success) {
        onCompiled(result);
      } else {
        setError('Compilation failed. Please check the diagnostics.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">TypeScript Compiler</h3>
        <ActionButton
          variant="primary"
          loading={isCompiling}
          onClick={handleCompile}
        >
          {isCompiling ? 'Compiling...' : 'Compile Simulation'}
        </ActionButton>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden bg-white">
        <CodeEditor
          value={code}
          language="typescript"
          onChange={setCode}
          height="500px"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900">Editor Tips</h4>
        <ul className="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Use TypeScript syntax for better type checking</li>
          <li>Access DOM elements through getElementById or querySelector</li>
          <li>Define your simulation logic in a class or module</li>
          <li>Handle browser events appropriately</li>
        </ul>
      </div>
    </div>
  );
}
