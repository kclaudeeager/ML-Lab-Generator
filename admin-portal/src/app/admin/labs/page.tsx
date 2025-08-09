"use client";
import LabForm from '../../../components/LabForm';
import ScienceLabForm from '../../../components/ScienceLabForm';
import LabOutput from '../../../components/LabOutput';
import LabReview from '../../../components/LabReview';
import LabExport from '../../../components/LabExport';
import LabEditor from '../../../components/LabEditor';
import LabTypeSelector from '../../../components/LabTypeSelector';
import SimulationWorkflow from '../../../components/SimulationWorkflow';
import { useState, useEffect } from 'react';

function getAuthHeader(username: string, password: string) {
  return 'Basic ' + btoa(`${username}:${password}`);
}

type Lab = {
  id: string;
  labType: string;
  requirements: string;
  lessonTopic: string;
  audience: string;
  duration: string;
  content: string;
  createdAt: string;
  author: string;
};

export default function LabsPage() {
  const [output, setOutput] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});
  const [labs, setLabs] = useState<Lab[]>([]);
  const [auth, setAuth] = useState<{ username: string; password: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [labCategory, setLabCategory] = useState('interactive'); // New state for lab category
  const [currentLabSubject, setCurrentLabSubject] = useState<'chemistry' | 'physics' | 'biology'>('chemistry');
  const [currentGradeLevel, setCurrentGradeLevel] = useState<string>('9-12');
  const [showSimulation, setShowSimulation] = useState(false);

  const labContent = edited ?? output;

  function toggleSection(key: string) {
    setCollapsed(c => ({ ...c, [key]: !c[key] }));
  }

  // Fetch labs from backend
  useEffect(() => {
    if (!auth) return;
    setLoadingLabs(true);
    fetch(process.env.NEXT_PUBLIC_API_URL + '/api/labs', {
      headers: { Authorization: getAuthHeader(auth.username, auth.password) },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) throw new Error('Unauthorized');
        return res.json();
      })
      .then((labs: Lab[]) => setLabs(labs))
      .catch(() => setAuthError('Invalid credentials or not authorized.'))
      .finally(() => setLoadingLabs(false));
  }, [auth, saveStatus]);

  // Save current lab
  async function handleSaveLab() {
    if (!auth || !labContent) return;
    setSaveStatus('saving');
    const body = {
      labType: 'interactive', // You may want to track this in state
      requirements: '', // You may want to track this in state
      lessonTopic: '', // You may want to track this in state
      audience: '', // You may want to track this in state
      duration: '', // You may want to track this in state
      content: labContent,
    };
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/save_lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(auth.username, auth.password),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 1500);
    } catch {
      setSaveStatus('error');
    }
  }

  // Delete a lab
  async function handleDeleteLab(id: string) {
    if (!auth) return;
    await fetch(process.env.NEXT_PUBLIC_API_URL + `/api/labs/${id}`, {
      method: 'DELETE',
      headers: { Authorization: getAuthHeader(auth.username, auth.password) },
    });
    setSaveStatus('deleted');
    setTimeout(() => setSaveStatus(null), 1000);
  }

  // View a lab
  async function handleViewLab(lab: Lab) {
    setOutput(lab.content);
    setEdited(null);
  }

  // Auth prompt
  if (!auth) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white rounded-xl shadow p-8">
        <h2 className="text-xl font-bold mb-4 text-cmu-red">Admin Login</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const username = (form.elements.namedItem('username') as HTMLInputElement).value;
            const password = (form.elements.namedItem('password') as HTMLInputElement).value;
            setAuth({ username, password });
            setAuthError(null);
          }}
          className="space-y-4"
        >
          <input name="username" placeholder="Username" className="w-full border p-2 rounded" defaultValue="admin" />
          <input name="password" type="password" placeholder="Password" className="w-full border p-2 rounded" defaultValue="admin" />
          <button className="w-full bg-cmu-red text-white py-2 rounded font-semibold">Login</button>
          {authError && <div className="text-red-600 text-center">{authError}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-6 text-cmu-red">Lab Generator</h1>
        {/* Saved Labs List */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 text-cmu-red">Saved Labs</h2>
          {loadingLabs ? (
            <div>Loading...</div>
          ) : (
            <ul className="divide-y divide-cmu-light">
              {labs.map(lab => (
                <li key={lab.id} className="py-2 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-cmu-red">{lab.lessonTopic || 'Untitled'}</span>
                    <span className="ml-2 text-cmu-gray text-sm">({lab.labType})</span>
                    <span className="ml-2 text-cmu-gray text-xs">{new Date(lab.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:underline" onClick={() => handleViewLab(lab)}>View</button>
                    <button className="text-red-600 hover:underline" onClick={() => handleDeleteLab(lab.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Lab Category Selection */}
        <div className="mb-6">
          <LabTypeSelector value={labCategory} onTypeChange={setLabCategory} />
        </div>
        
        {/* Lab Generation Forms */}
        {labCategory === 'science' ? (
          <ScienceLabForm 
            onResult={setOutput} 
            onLabMetadata={(subject, gradeLevel) => {
              setCurrentLabSubject(subject);
              setCurrentGradeLevel(gradeLevel);
            }}
          />
        ) : (
          <LabForm onResult={setOutput} labType={labCategory} />
        )}
        
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
              {showSimulation ? (
                <div>
                  <button
                    onClick={() => setShowSimulation(false)}
                    className="mb-4 text-blue-600 hover:underline flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Lab Content
                  </button>
                  {labContent && (
                    <SimulationWorkflow
                      markdownContent={labContent}
                      subject={currentLabSubject}
                      gradeLevel={currentGradeLevel}
                    />
                  )}
                </div>
              ) : (
                <div>
                  <LabOutput 
                    output={labContent} 
                    labType={labCategory === 'science' ? 'science' : 'ml'}
                    labSubject={labCategory === 'science' ? currentLabSubject : undefined}
                  />
                  {labCategory === 'science' && labContent && (
                    <button
                      onClick={() => setShowSimulation(true)}
                      className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      Generate Simulation
                    </button>
                  )}
                </div>
              )}
              {labContent && (
                <button
                  className="mt-4 bg-cmu-red text-white px-4 py-2 rounded font-semibold"
                  onClick={handleSaveLab}
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Lab'}
                </button>
              )}
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
