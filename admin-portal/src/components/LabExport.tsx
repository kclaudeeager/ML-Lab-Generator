import { useState } from 'react';

interface LabExportProps {
  labContent: string;
}

export default function LabExport({ labContent }: LabExportProps) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch('/api/export_lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa('admin:admin') },
        body: JSON.stringify({ content: labContent, filename: 'lab.md' }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lab.md';
      a.click();
      window.URL.revokeObjectURL(url);
      setToast('Exported as Markdown!');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(labContent);
    setToast('Copied to clipboard!');
    setTimeout(() => setToast(null), 2000);
  }

  async function handleExportPDF() {
    setLoading(true);
    try {
      const res = await fetch('/api/export_lab_pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa('admin:admin') },
        body: JSON.stringify({ content: labContent, filename: 'lab.pdf' }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lab.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
      setToast('Exported as PDF!');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  }

  async function handleExportDOCX() {
    setLoading(true);
    try {
      const res = await fetch('/api/export_lab_docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Basic ' + btoa('admin:admin') },
        body: JSON.stringify({ content: labContent, filename: 'lab.docx' }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lab.docx';
      a.click();
      window.URL.revokeObjectURL(url);
      setToast('Exported as DOCX!');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  }

  return (
    <div className="bg-cmu-white rounded-xl shadow p-6 flex flex-col items-center">
      <div className="flex gap-4 mb-2 flex-wrap justify-center">
        <button
          onClick={handleExport}
          disabled={!labContent || loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-white bg-cmu-red hover:bg-cmu-dark transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <span className="loader border-2 border-cmu-white border-t-cmu-red animate-spin rounded-full w-5 h-5 inline-block" />}
          Export as Markdown
        </button>
        <button
          onClick={handleCopy}
          disabled={!labContent || loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-red bg-cmu-white hover:bg-cmu-red hover:text-cmu-white transition disabled:opacity-50"
        >
          Copy to Clipboard
        </button>
        <button
          onClick={handleExportPDF}
          disabled={!labContent || loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-gray text-cmu-gray bg-cmu-light hover:bg-cmu-gray hover:text-cmu-white transition disabled:opacity-50"
        >
          Export as PDF
        </button>
        <button
          onClick={handleExportDOCX}
          disabled={!labContent || loading}
          className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-gray text-cmu-gray bg-cmu-light hover:bg-cmu-gray hover:text-cmu-white transition disabled:opacity-50"
        >
          Export as DOCX
        </button>
      </div>
      {toast && (
        <div className="mt-2 px-4 py-2 rounded bg-cmu-red text-cmu-white font-semibold shadow text-center animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
