import { useState } from 'react';

interface LabFormProps {
  onResult: (output: string) => void;
}

const steps = [
  'Lab Type',
  'Requirements',
  'Lesson Topic',
  'Audience & Duration',
  'Review & Generate',
];

export default function LabForm({ onResult }: LabFormProps) {
  const [step, setStep] = useState(0);
  const [requirements, setRequirements] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [audience, setAudience] = useState('beginners');
  const [duration, setDuration] = useState('1-2 hours');
  const [labType, setLabType] = useState('interactive');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For review step
  const review = [
    { label: 'Lab Type', value: labType },
    { label: 'Requirements', value: requirements },
    { label: 'Lesson Topic', value: lessonTopic },
    { label: 'Target Audience', value: audience },
    { label: 'Duration', value: duration },
  ];

  function next() {
    setError(null);
    // Validation for each step
    if (step === 1 && !requirements.trim()) {
      setError('Requirements are required.');
      return;
    }
    if (step === 2 && !lessonTopic.trim()) {
      setError('Lesson topic is required.');
      return;
    }
    setStep(s => Math.min(s + 1, steps.length - 1));
  }
  function prev() {
    setError(null);
    setStep(s => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Step 1: Read requirements
      const reqRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/read_requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirements, lesson_topic: lessonTopic, target_audience: audience, duration }),
      });
      const reqData = await reqRes.json();
      const requirementsAnalysis = reqData.content?.[0]?.text || '';

      // Step 2: Generate lab outline
      const outlineRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/generate_lab_outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lesson_topic: lessonTopic, requirements_analysis: requirementsAnalysis, outline_type: labType }),
      });
      const outlineData = await outlineRes.json();
      const outline = outlineData.content?.[0]?.text || '';

      // Step 3: Generate full lab based on type
      let labContent = outline;
      if (labType === 'interactive') {
        const labRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/generate_interactive_lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outline, interactivity_level: 'high', include_code: true, reflection_questions: true }),
        });
        const labData = await labRes.json();
        labContent = labData.content?.[0]?.text || '';
      } else if (labType === 'gamified') {
        // First generate interactive lab, then gamify it
        const labRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/generate_interactive_lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outline, interactivity_level: 'high', include_code: true, reflection_questions: true }),
        });
        const labData = await labRes.json();
        const baseLab = labData.content?.[0]?.text || '';
        const gamifiedRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/generate_gamified_lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base_lab: baseLab, gamification_elements: ['points', 'badges', 'challenges'], difficulty_progression: 'linear' }),
        });
        const gamifiedData = await gamifiedRes.json();
        labContent = gamifiedData.content?.[0]?.text || '';
      } else if (labType === 'project-based') {
        const projectRes = await fetch(process.env.NEXT_PUBLIC_API_URL + '/api/generate_project_based_lab', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outline, project_theme: 'healthcare', complexity_level: 'beginner', deliverables: ['analysis report', 'working model'] }),
        });
        const projectData = await projectRes.json();
        labContent = projectData.content?.[0]?.text || '';
      }
      onResult(labContent);
    } catch (err) {
      setError('Error generating lab: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-cmu-white rounded-xl shadow-lg p-8 mt-6">
      {/* Progress Bar */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${i <= step ? 'bg-cmu-red text-cmu-white border-cmu-red' : 'bg-cmu-light text-cmu-gray border-cmu-gray'}`}>{i + 1}</div>
            {i < steps.length - 1 && <div className={`flex-1 h-1 ${i < step ? 'bg-cmu-red' : 'bg-cmu-light'} mx-1 rounded`} />}
          </div>
        ))}
      </div>
      {/* Step Content */}
      <div className="min-h-[180px] transition-all duration-300">
        {step === 0 && (
          <div className="flex flex-col items-center">
            <label className="block text-lg font-semibold mb-4 text-cmu-red">Select Lab Type</label>
            <div className="flex gap-4">
              {['interactive', 'gamified', 'project-based'].map(type => (
                <button
                  key={type}
                  type="button"
                  className={`px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-200 text-lg shadow-sm ${labType === type ? 'bg-cmu-red text-cmu-white border-cmu-red' : 'bg-cmu-white text-cmu-red border-cmu-red hover:bg-cmu-light'}`}
                  onClick={() => setLabType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <label className="block text-lg font-semibold mb-2 text-cmu-red">Requirements</label>
            <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={4} className="w-full rounded-lg border-2 border-cmu-gray p-3 focus:ring-2 focus:ring-cmu-red focus:border-cmu-red text-base" required />
            <p className="text-sm text-cmu-gray mt-2">Describe the course requirements and learning objectives for this lab.</p>
          </div>
        )}
        {step === 2 && (
          <div>
            <label className="block text-lg font-semibold mb-2 text-cmu-red">Lesson Topic</label>
            <input value={lessonTopic} onChange={e => setLessonTopic(e.target.value)} className="w-full rounded-lg border-2 border-cmu-gray p-3 focus:ring-2 focus:ring-cmu-red focus:border-cmu-red text-base" required />
            <p className="text-sm text-cmu-gray mt-2">What is the main topic for this lab?</p>
          </div>
        )}
        {step === 3 && (
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-2 text-cmu-red">Target Audience</label>
              <input value={audience} onChange={e => setAudience(e.target.value)} className="w-full rounded-lg border-2 border-cmu-gray p-3 focus:ring-2 focus:ring-cmu-red focus:border-cmu-red text-base" />
              <p className="text-sm text-cmu-gray mt-2">E.g., beginners, some programming experience, etc.</p>
            </div>
            <div className="flex-1">
              <label className="block text-lg font-semibold mb-2 text-cmu-red">Duration</label>
              <input value={duration} onChange={e => setDuration(e.target.value)} className="w-full rounded-lg border-2 border-cmu-gray p-3 focus:ring-2 focus:ring-cmu-red focus:border-cmu-red text-base" />
              <p className="text-sm text-cmu-gray mt-2">E.g., 1 hour, 2 hours, etc.</p>
            </div>
          </div>
        )}
        {step === 4 && (
          <div>
            <label className="block text-lg font-semibold mb-4 text-cmu-red">Review & Generate</label>
            <ul className="mb-6 space-y-2">
              {review.map(r => (
                <li key={r.label} className="flex items-center gap-2 text-base">
                  <span className="font-medium text-cmu-gray w-40 inline-block">{r.label}:</span>
                  <span className="text-cmu-red font-semibold">{r.value}</span>
                </li>
              ))}
            </ul>
            <button type="submit" disabled={loading} className="w-full bg-cmu-red hover:bg-cmu-dark text-cmu-white font-semibold py-3 rounded-lg transition text-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="loader border-2 border-cmu-white border-t-cmu-red animate-spin rounded-full w-5 h-5 inline-block" />}
              {loading ? 'Generating Lab...' : 'Generate Lab'}
            </button>
          </div>
        )}
      </div>
      {/* Error message */}
      {error && <div className="mt-4 text-red-600 text-center font-medium">{error}</div>}
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button type="button" onClick={prev} disabled={step === 0 || loading} className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-gray text-cmu-gray bg-cmu-light hover:bg-cmu-gray hover:text-cmu-white transition disabled:opacity-50">Back</button>
        {step < steps.length - 1 && (
          <button type="button" onClick={next} disabled={loading} className="px-6 py-2 rounded-lg font-semibold border-2 border-cmu-red text-cmu-red bg-cmu-white hover:bg-cmu-red hover:text-cmu-white transition disabled:opacity-50">Next</button>
        )}
      </div>
    </form>
  );
}
