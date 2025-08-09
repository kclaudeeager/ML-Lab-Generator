import { useState } from 'react';
import { SimulationMetadata } from '../services/types/simulation';
import SimulationAPIClient from '../services/SimulationAPIClient';
import CompilerView from './CompilerView';

interface SimulationEditorProps {
  markdownContent: string;
  initialMetadata: SimulationMetadata;
  onSimulationGenerated?: (code: string, metadata: SimulationMetadata) => void;
}

export default function SimulationEditor({
  markdownContent,
  initialMetadata,
  onSimulationGenerated
}: SimulationEditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationCode, setSimulationCode] = useState<string>('');
  const [metadata, setMetadata] = useState<SimulationMetadata>(initialMetadata);

  const handleGenerateSimulation = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await SimulationAPIClient.generateSimulation(markdownContent, metadata);
      const generatedCode = result.content[0]?.text || '';
      setSimulationCode(generatedCode);
      onSimulationGenerated?.(generatedCode, metadata);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate simulation');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Interactive Simulation Editor</h2>
        <div className="flex items-center gap-4">
          <select
            value={metadata.rendering_library}
            onChange={(e) => setMetadata({
              ...metadata,
              rendering_library: e.target.value as SimulationMetadata['rendering_library']
            })}
            className="px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500"
          >
            <option value="canvas">HTML Canvas</option>
            <option value="p5js">p5.js</option>
            <option value="vanilla">Vanilla TypeScript</option>
          </select>

          <select
            value={metadata.complexity_level}
            onChange={(e) => setMetadata({
              ...metadata,
              complexity_level: e.target.value as SimulationMetadata['complexity_level']
            })}
            className="px-3 py-2 rounded border focus:ring-2 focus:ring-blue-500"
          >
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={handleGenerateSimulation}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Simulation'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {simulationCode && (
        <CompilerView
          code={simulationCode}
          onChange={setSimulationCode}
          onCompilationComplete={(result) => {
            if (result.success) {
              // Handle successful compilation
              console.log('Compilation successful:', result.compiled_code);
            }
          }}
        />
      )}
    </div>
  );
}
