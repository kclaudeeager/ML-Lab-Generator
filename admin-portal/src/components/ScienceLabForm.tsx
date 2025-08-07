import { useState, useEffect } from 'react';

interface ScienceLabFormProps {
  onResult: (output: string) => void;
}

interface Topic {
  topic: string;
  title: string;
  grade_levels: string[];
  difficulty: string;
  concepts: string[];
  estimated_time: number;
}

export default function ScienceLabForm({ onResult }: ScienceLabFormProps) {
  const [subject, setSubject] = useState('chemistry');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [labType, setLabType] = useState('hands-on-experiment');
  const [gradeLevel, setGradeLevel] = useState('9-12');
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load topics when subject changes
  useEffect(() => {
    loadTopics();
  }, [subject]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadTopics() {
    setLoadingTopics(true);
    setSelectedTopic('');
    try {
      const res = await fetch('/api/list_science_topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({ subject }),
      });

      if (!res.ok) {
        throw new Error(`Failed to load topics: ${res.status}`);
      }

      const data = await res.json();
      // Parse the text response to extract topics
      const text = data.content?.[0]?.text || '';
      const lines = text.split('\n');
      const topicsData: Topic[] = [];
      
      let currentTopic: Partial<Topic> = {};
      for (const line of lines) {
        if (line.startsWith('**') && line.endsWith('**')) {
          if (currentTopic.title) {
            topicsData.push(currentTopic as Topic);
          }
          currentTopic = { title: line.replace(/\*\*/g, '') };
        } else if (line.startsWith('- Topic ID:')) {
          currentTopic.topic = line.replace('- Topic ID:', '').trim();
        } else if (line.startsWith('- Grade Levels:')) {
          currentTopic.grade_levels = line.replace('- Grade Levels:', '').trim().split(', ');
        } else if (line.startsWith('- Difficulty:')) {
          currentTopic.difficulty = line.replace('- Difficulty:', '').trim();
        } else if (line.startsWith('- Key Concepts:')) {
          currentTopic.concepts = line.replace('- Key Concepts:', '').trim().split(', ');
        } else if (line.startsWith('- Estimated Time:')) {
          const timeStr = line.replace('- Estimated Time:', '').replace(' minutes', '').trim();
          currentTopic.estimated_time = parseInt(timeStr) || 30;
        }
      }
      
      if (currentTopic.title) {
        topicsData.push(currentTopic as Topic);
      }

      setTopics(topicsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingTopics(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedTopic) {
      setError('Please select a topic');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate_science_lab', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({
          subject,
          topic: selectedTopic,
          lab_type: labType,
          grade_level: gradeLevel,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Request failed: ${res.status}`);
      }

      const data = await res.json();
      const labContent = data.content?.[0]?.text || '';
      
      if (labContent) {
        onResult(labContent);
      } else {
        throw new Error('No lab content received');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const selectedTopicData = topics.find(t => t.topic === selectedTopic);

  return (
    <div className="bg-cmu-white rounded-xl shadow border border-cmu-light p-6">
      <h2 className="text-xl font-bold mb-4 text-cmu-red">Generate Science Lab</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label className="block font-semibold mb-2 text-cmu-red">Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-3 border border-cmu-light rounded-lg focus:ring-2 focus:ring-cmu-red focus:border-cmu-red"
          >
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="biology">Biology</option>
          </select>
        </div>

        {/* Topic Selection */}
        <div>
          <label className="block font-semibold mb-2 text-cmu-red">Topic:</label>
          {loadingTopics ? (
            <div className="text-cmu-gray">Loading topics...</div>
          ) : (
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border border-cmu-light rounded-lg focus:ring-2 focus:ring-cmu-red focus:border-cmu-red"
              disabled={topics.length === 0}
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.topic} value={topic.topic}>
                  {topic.title} ({topic.difficulty})
                </option>
              ))}
            </select>
          )}
          
          {selectedTopicData && (
            <div className="mt-3 p-3 bg-cmu-light rounded-lg">
              <div className="text-sm text-cmu-gray">
                <div><strong>Grade Levels:</strong> {selectedTopicData.grade_levels.join(', ')}</div>
                <div><strong>Difficulty:</strong> {selectedTopicData.difficulty}</div>
                <div><strong>Key Concepts:</strong> {selectedTopicData.concepts.join(', ')}</div>
                <div><strong>Estimated Time:</strong> {selectedTopicData.estimated_time} minutes</div>
              </div>
            </div>
          )}
        </div>

        {/* Lab Type Selection */}
        <div>
          <label className="block font-semibold mb-2 text-cmu-red">Lab Type:</label>
          <select
            value={labType}
            onChange={(e) => setLabType(e.target.value)}
            className="w-full p-3 border border-cmu-light rounded-lg focus:ring-2 focus:ring-cmu-red focus:border-cmu-red"
          >
            <option value="hands-on-experiment">Hands-on Experiment</option>
            <option value="simulation">Simulation</option>
            <option value="inquiry-based">Inquiry-based</option>
            <option value="demonstration">Demonstration</option>
          </select>
        </div>

        {/* Grade Level */}
        <div>
          <label className="block font-semibold mb-2 text-cmu-red">Grade Level:</label>
          <select
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
            className="w-full p-3 border border-cmu-light rounded-lg focus:ring-2 focus:ring-cmu-red focus:border-cmu-red"
          >
            <option value="6-8">6-8 (Middle School)</option>
            <option value="9-12">9-12 (High School)</option>
            <option value="13+">13+ (College)</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !selectedTopic}
          className="w-full bg-cmu-red text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Generating Science Lab...' : 'Generate Science Lab'}
        </button>
      </form>
    </div>
  );
}
