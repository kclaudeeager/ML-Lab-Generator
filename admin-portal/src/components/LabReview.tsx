import { useState } from 'react';

interface LabReviewProps {
  labContent: string;
}

function parseReview(review: string) {
  // Simple parser to split review into sections by numbered headings or keywords
  const lines = review.split('\n');
  const sections: { title: string; content: string[] }[] = [];
  let current: { title: string; content: string[] } | null = null;
  for (const line of lines) {
    const match = line.match(/^(\d+\.|[A-Z][a-z]+:|\*\*)\s*(.*)/);
    if (match) {
      if (current) sections.push(current);
      current = { title: match[2] || match[1], content: [] };
    } else if (current) {
      current.content.push(line);
    }
  }
  if (current) sections.push(current);
  return sections.length > 0 ? sections : [{ title: '', content: lines }];
}

export default function LabReview({ labContent }: LabReviewProps) {
  const [review, setReview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  async function handleReview() {
    setLoading(true);
    setReview(null);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/review_lab_quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lab_content: labContent, review_criteria: ['clarity', 'engagement', 'educational_value'], target_audience: 'beginners' }),
      });
      const data = await res.json();
      setReview(data.content?.[0]?.text || 'No review result.');
    } catch (err) {
      setReview('Error: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const parsed = review ? parseReview(review) : [];

  return (
    <div className="bg-cmu-white rounded-xl shadow p-6">
      <button
        onClick={handleReview}
        disabled={loading || !labContent}
        className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-white bg-cmu-red hover:bg-cmu-dark transition disabled:opacity-50 mb-4"
      >
        {loading ? (
          <span className="flex items-center gap-2"><span className="loader border-2 border-cmu-white border-t-cmu-red animate-spin rounded-full w-5 h-5 inline-block" /> Reviewing...</span>
        ) : 'Review Lab Quality'}
      </button>
      {review && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-cmu-red">Lab Review</h3>
            <button
              className="p-2 rounded hover:bg-cmu-light transition"
              onClick={() => setCollapsed(c => !c)}
              aria-expanded={!collapsed}
              aria-controls="lab-review-details"
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              <svg className={`w-5 h-5 text-cmu-red transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
          <div id="lab-review-details" className={collapsed ? 'hidden' : ''}>
            {parsed.map((section, idx) => (
              <div key={idx} className="mb-4">
                {section.title && (
                  <div className="font-semibold text-cmu-gray mb-1 flex items-center gap-2">
                    <span className="inline-block px-2 py-1 rounded bg-cmu-light text-cmu-red text-xs font-bold uppercase tracking-wide">{section.title}</span>
                  </div>
                )}
                <div className="text-base text-cmu-gray whitespace-pre-line">
                  {section.content.join('\n')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
