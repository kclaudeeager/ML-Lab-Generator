import { useState } from 'react';

interface LabEditorProps {
  labContent: string;
  onUpdate: (content: string) => void;
}

export default function LabEditor({ labContent, onUpdate }: LabEditorProps) {
  const [content, setContent] = useState(labContent);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleOptimize() {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/optimize_lab_content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa('admin:admin') },
        body: JSON.stringify({ lab_content: content, review_feedback: 'User edits', optimization_goals: ['improve_clarity', 'increase_engagement'] }),
      });
      const data = await res.json();
      const optimized = data.content?.[0]?.text || content;
      setContent(optimized);
      onUpdate(optimized);
      setSaved(true);
    } catch (err) {
      console.error('Error optimizing lab content:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    onUpdate(content);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function handleReset() {
    setContent(labContent);
    setSaved(false);
  }

  return (
    <div className="mt-10 bg-cmu-white rounded-xl shadow-lg p-8">
      <h2 className="text-xl font-bold mb-4 text-cmu-red">Edit Lab Content</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={14}
        className="w-full font-mono text-base rounded-lg border-2 border-cmu-gray p-4 focus:ring-2 focus:ring-cmu-red focus:border-cmu-red resize-y min-h-[200px] mb-4 bg-cmu-light text-cmu-gray"
        spellCheck={false}
      />
      <div className="flex gap-4 mt-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-red bg-cmu-white hover:bg-cmu-red hover:text-cmu-white transition disabled:opacity-50"
        >
          Save
        </button>
        <button
          onClick={handleOptimize}
          disabled={loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-white bg-cmu-red hover:bg-cmu-dark transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="loader border-2 border-cmu-white border-t-cmu-red animate-spin rounded-full w-5 h-5 inline-block" />}
          {loading ? 'Optimizing...' : 'Optimize'}
        </button>
        <button
          onClick={handleReset}
          disabled={loading || content === labContent}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-gray text-cmu-gray bg-cmu-light hover:bg-cmu-gray hover:text-cmu-white transition disabled:opacity-50"
        >
          Reset
        </button>
        {saved && <span className="text-cmu-red font-semibold ml-2">Saved!</span>}
      </div>
    </div>
  );
}
