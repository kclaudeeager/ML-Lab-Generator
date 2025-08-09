'use client';

import React, { useState } from 'react';

interface SimulationMetadata {
  subject: string;
  grade_level: string;
  rendering_library: string;
  complexity_level: string;
  [key: string]: unknown;
}

interface SimulationGeneratorProps {
  markdownContent: string;
  subject: 'chemistry' | 'physics' | 'biology';
  gradeLevel: string;
  onSimulationGenerated: (simulation: string, metadata: SimulationMetadata) => void;
}

interface SimulationResult {
  content: Array<{ type: string; text: string }>;
}

export default function SimulationGenerator({ 
  markdownContent, 
  subject, 
  gradeLevel, 
  onSimulationGenerated 
}: SimulationGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [simulationCode, setSimulationCode] = useState('');
  const [simulationMetadata, setSimulationMetadata] = useState<SimulationMetadata | null>(null);
  const [renderingLibrary, setRenderingLibrary] = useState<'canvas' | 'p5js' | 'vanilla'>('canvas');
  const [complexityLevel, setComplexityLevel] = useState<'basic' | 'intermediate' | 'advanced'>('intermediate');
  const [enhancementGoals, setEnhancementGoals] = useState<string[]>([]);
  const [showEnhancementOptions, setShowEnhancementOptions] = useState(false);

  const availableEnhancements = [
    'animations',
    'user_experience', 
    'accessibility',
    'mobile_support',
    'advanced_controls',
    'data_visualization'
  ];

  const generateSimulation = async () => {
    if (!markdownContent) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/convert_markdown_to_simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown_content: markdownContent,
          subject,
          grade_level: gradeLevel,
          rendering_library: renderingLibrary,
          complexity_level: complexityLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate simulation: ${response.statusText}`);
      }

      const result: SimulationResult = await response.json();
      const generatedCode = result.content[0]?.text || '';
      
      setSimulationCode(generatedCode);
      
      // Try to extract metadata from the generated content
      const metadataMatch = generatedCode.match(/\/\*\s*METADATA\s*([\s\S]*?)\s*\*\//);
      let metadata: SimulationMetadata;
      
      if (metadataMatch) {
        try {
          metadata = JSON.parse(metadataMatch[1]) as SimulationMetadata;
        } catch {
          metadata = {
            subject,
            grade_level: gradeLevel,
            rendering_library: renderingLibrary,
            complexity_level: complexityLevel
          };
        }
      } else {
        metadata = {
          subject,
          grade_level: gradeLevel,
          rendering_library: renderingLibrary,
          complexity_level: complexityLevel
        };
      }
      
      setSimulationMetadata(metadata);
      onSimulationGenerated(generatedCode, metadata);
      setShowEnhancementOptions(true);
    } catch (error) {
      console.error('Error generating simulation:', error);
      alert('Failed to generate simulation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceSimulation = async () => {
    if (!simulationCode || enhancementGoals.length === 0) return;
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/enhance_simulation_interactivity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulation_code: simulationCode,
          enhancement_goals: enhancementGoals
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to enhance simulation: ${response.statusText}`);
      }

      const result: SimulationResult = await response.json();
      const enhancedCode = result.content[0]?.text || '';
      
      setSimulationCode(enhancedCode);
      if (simulationMetadata) {
        onSimulationGenerated(enhancedCode, simulationMetadata);
      }
    } catch (error) {
      console.error('Error enhancing simulation:', error);
      alert('Failed to enhance simulation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleEnhancement = (enhancement: string) => {
    setEnhancementGoals(prev => 
      prev.includes(enhancement) 
        ? prev.filter(e => e !== enhancement)
        : [...prev, enhancement]
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Interactive Simulation Generator</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Subject:</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
            {subject}
          </span>
          <span className="text-sm text-gray-600">Grade:</span>
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
            {gradeLevel}
          </span>
        </div>
      </div>

      {!simulationCode ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rendering Library
              </label>
              <select
                value={renderingLibrary}
                onChange={(e) => setRenderingLibrary(e.target.value as 'canvas' | 'p5js' | 'vanilla')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="canvas">HTML5 Canvas</option>
                <option value="p5js">p5.js</option>
                <option value="vanilla">Vanilla TypeScript</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complexity Level
              </label>
              <select
                value={complexityLevel}
                onChange={(e) => setComplexityLevel(e.target.value as 'basic' | 'intermediate' | 'advanced')}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateSimulation}
            disabled={isGenerating || !markdownContent}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? 'Generating Interactive Simulation...' : 'Generate Interactive Simulation'}
          </button>

          {!markdownContent && (
            <p className="text-sm text-gray-500 text-center">
              Generate a lab first to create an interactive simulation
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-600 font-medium">
              ✅ Interactive simulation generated successfully!
            </p>
            <button
              onClick={() => {
                setSimulationCode('');
                setSimulationMetadata(null);
                setShowEnhancementOptions(false);
                setEnhancementGoals([]);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Generate New Simulation
            </button>
          </div>

          {showEnhancementOptions && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-md font-medium text-gray-800 mb-3">Enhance Simulation</h4>
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
              <button
                onClick={enhanceSimulation}
                disabled={isGenerating || enhancementGoals.length === 0}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Enhancing Simulation...' : 'Enhance Simulation'}
              </button>
            </div>
          )}

          {simulationMetadata && (
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="text-md font-medium text-blue-800 mb-2">Simulation Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Library:</span>
                  <span className="ml-2 text-blue-900">{simulationMetadata.rendering_library || renderingLibrary}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Complexity:</span>
                  <span className="ml-2 text-blue-900">{simulationMetadata.complexity_level || complexityLevel}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
