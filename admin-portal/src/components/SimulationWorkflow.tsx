import React, { useState, useCallback } from 'react';
import EnhancedSimulationViewer from './EnhancedSimulationViewer';

interface SimulationWorkflowProps {
  initialCode?: string;
  metadata: {
    subject: string;
    grade_level: string;
    rendering_library: string;
    complexity_level: string;
    [key: string]: unknown;
  };
  onCodeChange?: (code: string) => void;
}

interface EnhancementGoal {
  id: string;
  label: string;
  description: string;
}

const ENHANCEMENT_GOALS: EnhancementGoal[] = [
  {
    id: 'animations',
    label: 'Smooth Animations',
    description: 'Add fluid transitions and visual feedback'
  },
  {
    id: 'interactivity',
    label: 'Enhanced Interactivity',
    description: 'More responsive controls and real-time updates'
  },
  {
    id: 'educational',
    label: 'Educational Value',
    description: 'Step-by-step explanations and guided experiments'
  },
  {
    id: 'visualization',
    label: 'Better Visualization',
    description: 'Improved graphics and data representation'
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    description: 'Keyboard navigation and screen reader support'
  },
  {
    id: 'mobile',
    label: 'Mobile-Friendly',
    description: 'Touch interactions and responsive design'
  }
];

type WorkflowStep = 'preview' | 'enhance';

export default function SimulationWorkflow({ 
  initialCode = '', 
  metadata, 
  onCodeChange 
}: SimulationWorkflowProps) {
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('preview');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementHistory, setEnhancementHistory] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateCode = useCallback((newCode: string) => {
    setCurrentCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const enhanceSimulation = async () => {
    if (!currentCode.trim()) {
      setError('No simulation code to enhance');
      return;
    }

    if (selectedGoals.length === 0) {
      setError('Please select at least one enhancement goal');
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      // Save current state to history
      setEnhancementHistory(prev => [...prev, currentCode]);

      const goals = selectedGoals.map(id => 
        ENHANCEMENT_GOALS.find(goal => goal.id === id)?.description || id
      );

      const response = await fetch('/api/enhance_simulation_interactivity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          simulation_code: currentCode,
          enhancement_goals: goals,
        }),
      });

      if (!response.ok) {
        throw new Error(`Enhancement failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.content && data.content[0] && data.content[0].text) {
        updateCode(data.content[0].text);
        setSelectedGoals([]); // Reset selection after successful enhancement
        setCurrentStep('preview'); // Go back to preview to see the enhanced result
      } else {
        throw new Error('Invalid response format from enhancement API');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  const undoLastEnhancement = () => {
    if (enhancementHistory.length > 0) {
      const lastCode = enhancementHistory[enhancementHistory.length - 1];
      setEnhancementHistory(prev => prev.slice(0, -1));
      updateCode(lastCode);
      setError(null);
    }
  };

  const resetToOriginal = () => {
    if (enhancementHistory.length > 0) {
      updateCode(enhancementHistory[0]);
      setEnhancementHistory([]);
      setError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Steps Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Simulation Workflow</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentStep('preview')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                currentStep === 'preview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1. Preview Current
            </button>
            <button
              onClick={() => setCurrentStep('enhance')}
              disabled={!currentCode.trim()}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                currentStep === 'enhance'
                  ? 'bg-blue-600 text-white'
                  : !currentCode.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              2. Enhance Simulation
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-4">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'preview' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${
              currentStep === 'enhance' ? 'bg-blue-600' : 'bg-gray-300'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep === 'enhance' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">Preview & Review</span>
            <span className="text-sm text-gray-600">Enhance & Improve</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'preview' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Current Simulation Preview</h3>
          <p className="text-gray-600 mb-4">
            Review your current simulation below. Once you&apos;re satisfied with how it looks and works, 
            you can proceed to the enhancement step to improve specific aspects.
          </p>
          
          {currentCode.trim() ? (
            <div className="space-y-4">
              <EnhancedSimulationViewer
                simulationCode={currentCode}
                metadata={metadata}
              />
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  {enhancementHistory.length > 0 
                    ? `Version ${enhancementHistory.length + 1} (Enhanced ${enhancementHistory.length} time${enhancementHistory.length === 1 ? '' : 's'})`
                    : 'Original Version'
                  }
                </div>
                <button
                  onClick={() => setCurrentStep('enhance')}
                  className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                >
                  Ready to Enhance →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No simulation code available for preview.</p>
              <p className="text-sm mt-2">Generate or load simulation code first.</p>
            </div>
          )}
        </div>
      )}

      {currentStep === 'enhance' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Simulation Enhancement</h3>
            <button
              onClick={() => setCurrentStep('preview')}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              ← Back to Preview
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Enhancement Goals Selection */}
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Select Enhancement Goals:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ENHANCEMENT_GOALS.map(goal => (
                <label
                  key={goal.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGoals.includes(goal.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedGoals.includes(goal.id)}
                    onChange={() => handleGoalToggle(goal.id)}
                    className="sr-only"
                  />
                  <div className="font-medium text-sm">{goal.label}</div>
                  <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={enhanceSimulation}
              disabled={isEnhancing || selectedGoals.length === 0}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isEnhancing || selectedGoals.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isEnhancing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enhancing...
                </span>
              ) : (
                'Enhance Simulation'
              )}
            </button>

            {enhancementHistory.length > 0 && (
              <>
                <button
                  onClick={undoLastEnhancement}
                  className="px-4 py-2 bg-yellow-600 text-white rounded font-medium hover:bg-yellow-700 transition-colors"
                >
                  Undo Last Enhancement
                </button>
                
                <button
                  onClick={resetToOriginal}
                  className="px-4 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700 transition-colors"
                >
                  Reset to Original
                </button>
              </>
            )}
          </div>

          {/* Enhancement History */}
          {enhancementHistory.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Enhancement history: {enhancementHistory.length} version(s) saved
              </p>
            </div>
          )}

          {/* Enhanced Simulation Preview */}
          {currentCode && (
            <div className="mt-6">
              <h4 className="text-md font-medium mb-3">Enhanced Simulation Preview:</h4>
              <EnhancedSimulationViewer
                simulationCode={currentCode}
                metadata={metadata}
                onEnhance={selectedGoals.length > 0 ? enhanceSimulation : undefined}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
