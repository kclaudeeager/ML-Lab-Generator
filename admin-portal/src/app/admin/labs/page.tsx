"use client";
import LabForm from '../../../components/LabForm';
import LabOutput from '../../../components/LabOutput';
import LabReview from '../../../components/LabReview';
import LabExport from '../../../components/LabExport';
import LabEditor from '../../../components/LabEditor';
import { useState } from 'react';

export default function LabsPage() {
  const [output, setOutput] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});

  const labContent = edited ?? output;

  function toggleSection(key: string) {
    setCollapsed(c => ({ ...c, [key]: !c[key] }));
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-cmu-red">Lab Generator</h1>
        <LabForm onResult={setOutput} />
        <div className="mt-10 space-y-6">
          {/* Lab Output */}
          <div className="bg-cmu-white rounded-xl shadow border border-cmu-light">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cmu-light">
              <span className="text-lg font-bold text-cmu-red">Lab Output</span>
              <button
                className="p-2 rounded hover:bg-cmu-light transition"
                onClick={() => toggleSection('output')}
                aria-expanded={!collapsed['output']}
                aria-controls="lab-output-section"
                title={collapsed['output'] ? 'Expand' : 'Collapse'}
              >
                <svg className={`w-6 h-6 text-cmu-red transition-transform ${collapsed['output'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
            <div id="lab-output-section" className={collapsed['output'] ? 'hidden' : 'px-6 py-4'}>
              <LabOutput output={labContent} />
            </div>
          </div>
          {/* Lab Editor */}
          {labContent && (
            <div className="bg-cmu-white rounded-xl shadow border border-cmu-light">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cmu-light">
                <span className="text-lg font-bold text-cmu-red">Edit Lab Content</span>
                <button
                  className="p-2 rounded hover:bg-cmu-light transition"
                  onClick={() => toggleSection('editor')}
                  aria-expanded={!collapsed['editor']}
                  aria-controls="lab-editor-section"
                  title={collapsed['editor'] ? 'Expand' : 'Collapse'}
                >
                  <svg className={`w-6 h-6 text-cmu-red transition-transform ${collapsed['editor'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div id="lab-editor-section" className={collapsed['editor'] ? 'hidden' : 'px-6 py-4'}>
                <LabEditor labContent={labContent} onUpdate={setEdited} />
              </div>
            </div>
          )}
          {/* Lab Review */}
          {labContent && (
            <div className="bg-cmu-white rounded-xl shadow border border-cmu-light">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cmu-light">
                <span className="text-lg font-bold text-cmu-red">Lab Review</span>
                <button
                  className="p-2 rounded hover:bg-cmu-light transition"
                  onClick={() => toggleSection('review')}
                  aria-expanded={!collapsed['review']}
                  aria-controls="lab-review-section"
                  title={collapsed['review'] ? 'Expand' : 'Collapse'}
                >
                  <svg className={`w-6 h-6 text-cmu-red transition-transform ${collapsed['review'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div id="lab-review-section" className={collapsed['review'] ? 'hidden' : 'px-6 py-4'}>
                <LabReview labContent={labContent} />
              </div>
            </div>
          )}
          {/* Lab Export */}
          {labContent && (
            <div className="bg-cmu-white rounded-xl shadow border border-cmu-light">
              <div className="flex items-center justify-between px-6 py-4 border-b border-cmu-light">
                <span className="text-lg font-bold text-cmu-red">Export Lab</span>
                <button
                  className="p-2 rounded hover:bg-cmu-light transition"
                  onClick={() => toggleSection('export')}
                  aria-expanded={!collapsed['export']}
                  aria-controls="lab-export-section"
                  title={collapsed['export'] ? 'Expand' : 'Collapse'}
                >
                  <svg className={`w-6 h-6 text-cmu-red transition-transform ${collapsed['export'] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              <div id="lab-export-section" className={collapsed['export'] ? 'hidden' : 'px-6 py-4'}>
                <LabExport labContent={labContent} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
