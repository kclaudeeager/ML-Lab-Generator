import React from 'react';
import { CompilationDiagnostic } from '../../services/types/simulation';

interface DiagnosticsPanelProps {
  diagnostics: CompilationDiagnostic[];
}

export default function DiagnosticsPanel({ diagnostics }: DiagnosticsPanelProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b">
        <h3 className="font-medium text-gray-700">Compilation Diagnostics</h3>
      </div>
      <div className="p-4 max-h-40 overflow-y-auto bg-white">
        {diagnostics.length === 0 ? (
          <p className="text-green-600">No errors or warnings</p>
        ) : (
          <ul className="space-y-2">
            {diagnostics.map((diagnostic, index) => (
              <li 
                key={index}
                className={`flex items-start gap-2 text-sm font-mono ${
                  diagnostic.severity === 'error' ? 'text-red-600' :
                  diagnostic.severity === 'warning' ? 'text-amber-600' : 
                  'text-blue-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {diagnostic.severity === 'error' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {diagnostic.severity === 'warning' && (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  <span>
                    Line {diagnostic.line}, Col {diagnostic.column}:
                  </span>
                </div>
                <span className="font-normal">{diagnostic.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
