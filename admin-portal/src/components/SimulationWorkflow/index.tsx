import React, { useState } from 'react';
import { SimulationMetadata, CompilationResult } from '../../services/types/simulation';
import ActionButton from '../common/ActionButton';
import SimulationCompiler from '../SimulationCompiler';
import SimulationMetadataForm from './SimulationMetadataForm';
import SimulationPreview from './SimulationPreview';

interface SimulationWorkflowProps {
  markdownContent: string;
  subject: string;
  gradeLevel: string;
}

export default function SimulationWorkflow({ 
  markdownContent, 
  subject, 
  gradeLevel 
}: SimulationWorkflowProps) {
  const [step, setStep] = useState<'metadata' | 'compile' | 'enhance' | 'preview'>('metadata');
  const [metadata, setMetadata] = useState<SimulationMetadata>({
    subject,
    grade_level: gradeLevel,
    rendering_library: 'canvas',
    complexity_level: 'intermediate'
  });
  const [enhancementGoals, setEnhancementGoals] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [compiledCode, setCompiledCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSimulation = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/convert_markdown_to_simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({
          markdown_content: markdownContent,
          ...metadata
        })
      });

      if (!response.ok) throw new Error('Failed to generate simulation');
      const result = await response.json();
      
      if (result.content?.[0]?.text) {
        setGeneratedCode(result.content[0].text);
        setStep('compile');
      } else {
        throw new Error('No simulation code generated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate simulation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCompilationComplete = (result: CompilationResult) => {
    if (result.success) {
      setCompiledCode(result.compiled_code);
      setStep('enhance');
    }
  };

  const handleEnhanceSimulation = async () => {
    if (!generatedCode || enhancementGoals.length === 0) return;
    
    setIsEnhancing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/enhance_simulation_interactivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('admin:admin'),
        },
        body: JSON.stringify({
          simulation_code: generatedCode,
          enhancement_goals: enhancementGoals
        }),
      });

      if (!response.ok) throw new Error('Failed to enhance simulation');
      const result = await response.json();
      
      if (result.content?.[0]?.text) {
        setGeneratedCode(result.content[0].text);
        setStep('preview');
      } else {
        throw new Error('No enhanced simulation code received');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance simulation');
    } finally {
      setIsEnhancing(false);
    }
  };

  const availableEnhancements = [
    'animations',
    'user_experience', 
    'accessibility',
    'mobile_support',
    'advanced_controls',
    'data_visualization'
  ];

  const toggleEnhancement = (enhancement: string) => {
    setEnhancementGoals(prev => 
      prev.includes(enhancement) 
        ? prev.filter(e => e !== enhancement)
        : [...prev, enhancement]
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex justify-center items-center space-x-4 mb-8">
        {(['metadata', 'compile', 'enhance', 'preview'] as const).map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <div className="h-0.5 w-8 bg-gray-200" />}
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${step === s 
                  ? 'bg-blue-600 text-white' 
                  : step > s 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-600'}`}
            >
              {i + 1}
            </div>
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {step === 'metadata' && (
        <div className="space-y-4">
          <SimulationMetadataForm
            metadata={metadata}
            onChange={setMetadata}
          />
          <ActionButton
            variant="primary"
            loading={isGenerating}
            onClick={handleGenerateSimulation}
          >
            Generate Simulation
          </ActionButton>
        </div>
      )}

      {step === 'compile' && (
        <SimulationCompiler
          initialCode={generatedCode}
          onCompiled={handleCompilationComplete}
        />
      )}

      {step === 'enhance' && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-md font-medium text-gray-800 mb-3">Enhance Your Simulation</h4>
            <p className="text-sm text-gray-600 mb-4">
              Select enhancements to improve your simulation&#39;s functionality and user experience:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {availableEnhancements.map((enhancement) => (
                <label key={enhancement} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhancementGoals.includes(enhancement)}
                    onChange={() => toggleEnhancement(enhancement)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">
                    {enhancement.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep('preview')}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip Enhancement
              </button>
              <ActionButton
                variant="primary"
                loading={isEnhancing}
                disabled={enhancementGoals.length === 0}
                onClick={handleEnhanceSimulation}
              >
                {isEnhancing ? 'Enhancing...' : 'Enhance Simulation'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <SimulationPreview
          code={compiledCode}
          metadata={metadata}
        />
      )}
    </div>
  );
}
