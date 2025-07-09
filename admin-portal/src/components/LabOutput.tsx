import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface LabOutputProps {
  output: string | null;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

// Helper to split markdown into sections by heading
function splitSections(markdown: string) {
  const lines = markdown.split('\n');
  const sections: { heading: string; level: number; content: string[] }[] = [];
  let current: { heading: string; level: number; content: string[] } | null = null;
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.*)$/);
    if (match) {
      if (current) sections.push(current);
      current = { heading: match[2], level: match[1].length, content: [] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ heading: '', level: 0, content: lines }];
}

export default function LabOutput({ output }: LabOutputProps) {
  const markdownRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState<{ [key: number]: boolean }>({});

  function handleCopyAll() {
    if (markdownRef.current) {
      copyToClipboard(markdownRef.current.innerText);
    }
  }

  function handleDownload() {
    if (output) {
      const blob = new Blob([output], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lab.md';
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  if (!output) {
    return (
      <div className="flex flex-col items-center justify-center text-cmu-gray py-16">
        <svg className="w-16 h-16 mb-4 text-cmu-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div className="text-lg font-medium">No lab generated yet.</div>
        <div className="text-sm text-cmu-gray mt-2">Generate a lab to see the output here.</div>
      </div>
    );
  }

  // Split markdown into sections by heading
  const sections = splitSections(output);

  return (
    <div className="mt-10 bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-cmu-red">Generated Lab</h2>
        <div className="flex gap-2">
          <button onClick={handleCopyAll} className="px-3 py-1 rounded bg-cmu-red text-cmu-white font-semibold hover:bg-cmu-dark transition text-sm">Copy All</button>
          <button onClick={handleDownload} className="px-3 py-1 rounded bg-cmu-white text-cmu-red font-semibold border border-cmu-red hover:bg-cmu-red hover:text-cmu-white transition text-sm">Download</button>
        </div>
      </div>
      <div ref={markdownRef} className="prose prose-invert max-w-none bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto shadow-inner border border-gray-700">
        {sections.map((section, idx) => (
          <div key={idx} className="mb-8 border-b border-gray-800 pb-6">
            {section.heading && (
              <button
                className="flex items-center gap-2 text-left w-full mb-2 focus:outline-none"
                onClick={() => setCollapsed(c => ({ ...c, [idx]: !c[idx] }))}
                aria-expanded={!collapsed[idx]}
                aria-controls={`section-content-${idx}`}
              >
                <span className={`font-bold ${section.level === 1 ? 'text-3xl' : section.level === 2 ? 'text-2xl' : 'text-xl'} text-cmu-red`}>{section.heading}</span>
                <svg className={`w-5 h-5 ml-2 transition-transform ${collapsed[idx] ? 'rotate-180' : ''} text-cmu-red`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            )}
            <div id={`section-content-${idx}`} className={`${collapsed[idx] ? 'hidden' : ''}`}>
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code(props: any) {
                    const { inline, className = '', children, ...rest } = props;
                    return !inline ? (
                      <div className="relative group">
                        <pre className={className + ' !bg-gray-900 !rounded-lg !p-4'} {...rest as React.HTMLAttributes<HTMLPreElement>}>{children}</pre>
                        <button
                          className="absolute top-2 right-2 px-2 py-1 rounded bg-cmu-red text-cmu-white text-xs opacity-80 group-hover:opacity-100 transition"
                          onClick={() => copyToClipboard(String(children))}
                          title="Copy code"
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <code className={className + ' !text-cmu-red !bg-cmu-light !rounded px-1'} {...rest}>{children}</code>
                    );
                  },
                  h1: () => <></>,
                  h2: () => <></>,
                  h3: () => <></>,
                }}
              >{section.content.join('\n')}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
