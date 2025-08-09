import React from 'react';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  value: string;
  language: 'typescript' | 'javascript';
  height?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function CodeEditor({
  value,
  language,
  height = '400px',
  readOnly = false,
  onChange
}: EditorProps) {
  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      onChange={(value) => onChange?.(value || '')}
      options={{
        readOnly,
        minimap: { enabled: false },
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        wrappingStrategy: 'advanced',
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        renderWhitespace: 'selection',
      }}
    />
  );
}
