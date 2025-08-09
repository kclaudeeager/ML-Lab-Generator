'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SimulationVariable {
  name: string;
  type: string;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

interface SimulationMeta {
  title: string;
  subject: string;
  gradeLevel: string;
  safetyConsiderations?: string[];
  learningObjectives: string[];
  realWorldApplications?: string[];
  essentialQuestion?: string;
  variables: SimulationVariable[];
  outputs?: Array<{
    name: string;
    type?: string;
    unit?: string;
    description?: string;
  }>;
}

interface SimulationViewerProps {
  simulationCode: string;
  metadata: {
    subject: string;
    grade_level: string;
    rendering_library: string;
    complexity_level: string;
    [key: string]: unknown;
  };
  onEnhance?: () => void;
}

export default function EnhancedSimulationViewer({ 
  simulationCode, 
  metadata, 
  onEnhance 
}: SimulationViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'metadata'>('preview');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedMeta, setExtractedMeta] = useState<SimulationMeta | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Extract simulation metadata from code
  const extractSimulationMeta = useCallback((code: string): SimulationMeta | null => {
    try {
      // Find the simulationMeta export
      const metaMatch = code.match(/export const simulationMeta[^=]*=\s*({[\s\S]*?});/);
      if (!metaMatch) return null;

      // Clean and parse the metadata
      const metaStr = metaMatch[1]
        .replace(/(\w+):/g, '"$1":') // Add quotes to keys
        .replace(/'/g, '"') // Convert single quotes to double
        .replace(/,\s*}/g, '}') // Remove trailing commas
        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

      return JSON.parse(metaStr) as SimulationMeta;
    } catch (err) {
      console.error('Failed to extract simulation metadata:', err);
      return null;
    }
  }, []);

  // Generate enhanced HTML with proper variable controls
  const generateHTML = useCallback((code: string, meta: SimulationMeta | null) => {
    const isP5js = metadata.rendering_library === 'p5js';
    const dependencies = isP5js 
      ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>'
      : '';

    // Generate variable controls
    const generateControls = (simVars: SimulationVariable[]) => {
      return simVars.map(variable => {
        return `
          <div class="control-group">
            <label for="${variable.name}">${variable.name}</label>
            ${
              variable.type === 'slider'
                ? `<input 
                    type="range" 
                    id="${variable.name}" 
                    name="${variable.name}"
                    min="${variable.min || 0}" 
                    max="${variable.max || 100}" 
                    step="${variable.step || 1}" 
                    value="\${currentVariables['${variable.name}'] ?? variable.min ?? 50}"
                    onchange="updateVariable('${variable.name}', parseFloat(this.value))"
                  />
                  <span id="${variable.name}-value">\${currentVariables['${variable.name}'] ?? variable.min ?? 50}</span>`
                : variable.type === 'dropdown'
                ? `<select 
                    id="${variable.name}" 
                    name="${variable.name}"
                    onchange="updateVariable('${variable.name}', this.value)"
                  >
                    ${
                      variable.options?.map(option => 
                        `<option value="${option}" \${currentVariables['${variable.name}'] === '${option}' ? 'selected' : ''}>${option}</option>`
                      ).join('') || ''
                    }
                  </select>`
                : ''
            }
          </div>
        `;
      }).join('');
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta?.title || metadata.subject + ' Simulation'}</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .simulation-header {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            width: 100%;
        }
        .simulation-header h1 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 24px;
        }
        .simulation-header p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .simulation-container {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        canvas {
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            background-color: #fafafa;
            display: block;
            margin: 0 auto;
        }
        .controls {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
        }
        .controls h3 {
            margin: 0 0 15px 0;
            color: #333;
            text-align: center;
        }
        .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .control-group label {
            font-size: 14px;
            font-weight: 600;
            color: #495057;
            margin-bottom: 8px;
            text-align: center;
        }
        input[type="range"] {
            width: 100%;
            margin: 5px 0;
            accent-color: #667eea;
        }
        select {
            padding: 8px 12px;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 14px;
            background: white;
            min-width: 120px;
        }
        .value-display {
            font-size: 12px;
            color: #6c757d;
            font-weight: 500;
            margin-top: 5px;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        .error {
            color: #dc3545;
            background-color: #f8d7da;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            border: 1px solid #f5c6cb;
        }
        .safety-notice {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
        .learning-objectives {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
        }
    </style>
    ${dependencies}
</head>
<body>
    <div class="simulation-header">
        <h1>${meta?.title || metadata.subject.charAt(0).toUpperCase() + metadata.subject.slice(1) + ' Simulation'}</h1>
        <p><strong>Subject:</strong> ${metadata.subject} | <strong>Grade Level:</strong> ${metadata.grade_level} | <strong>Complexity:</strong> ${metadata.complexity_level}</p>
        ${meta?.essentialQuestion ? `<p><strong>Essential Question:</strong> ${meta.essentialQuestion}</p>` : ''}
    </div>
    
    ${meta?.safetyConsiderations?.length ? `
    <div class="safety-notice">
        <h4>Safety Considerations:</h4>
        <ul>
            ${meta.safetyConsiderations.map(safety => `<li>${safety}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    ${meta?.learningObjectives?.length ? `
    <div class="learning-objectives">
        <h4>Learning Objectives:</h4>
        <ul>
            ${meta.learningObjectives.map(obj => `<li>${obj}</li>`).join('')}
        </ul>
    </div>
    ` : ''}
    
    <div class="simulation-container">
        <canvas id="simulationCanvas" width="800" height="600"></canvas>
    </div>
    
    ${meta?.variables?.length ? `
    <div class="controls">
        <h3>Simulation Controls</h3>
        <div class="controls-grid">
            ${generateControls(meta.variables)}
        </div>
        <div style="text-align: center; margin-top: 20px;">
            <button onclick="resetSimulation()">Reset to Defaults</button>
        </div>
    </div>
    ` : ''}
    
    <script>
        let currentVariables = {};
        let simulationInstance = null;
        
        function updateVariable(name, value) {
            currentVariables[name] = value;
            document.getElementById(name + '-value').textContent = value;
            
            if (simulationInstance && simulationInstance.updateSimulation) {
                const canvas = document.getElementById('simulationCanvas');
                simulationInstance.updateSimulation(currentVariables, canvas);
            }
        }
        
        function resetSimulation() {
            ${meta?.variables ? meta.variables.map(v => 
              `currentVariables['${v.name}'] = ${v.min || (v.options?.[0] ? `'${v.options[0]}'` : 50)};`
            ).join('\n            ') : ''}
            
            // Update UI controls
            ${meta?.variables ? meta.variables.map(v => `
            document.getElementById('${v.name}').value = currentVariables['${v.name}'];
            if (document.getElementById('${v.name}-value')) {
                document.getElementById('${v.name}-value').textContent = currentVariables['${v.name}'];
            }`).join('\n            ') : ''}
            
            if (simulationInstance && simulationInstance.updateSimulation) {
                const canvas = document.getElementById('simulationCanvas');
                simulationInstance.updateSimulation(currentVariables, canvas);
            }
        }
        
        try {
            // Initialize simulation
            (function() {
                ${code}
                
                // Set up simulation instance
                simulationInstance = {
                    simulationMeta: typeof simulationMeta !== 'undefined' ? simulationMeta : null,
                    initializeSimulation: typeof initializeSimulation !== 'undefined' ? initializeSimulation : null,
                    runSimulation: typeof runSimulation !== 'undefined' ? runSimulation : null,
                    updateSimulation: typeof updateSimulation !== 'undefined' ? updateSimulation : null,
                    renderVisualization: typeof renderVisualization !== 'undefined' ? renderVisualization : null
                };
                
                // Initialize canvas and simulation
                const canvas = document.getElementById('simulationCanvas');
                if (canvas && simulationInstance.initializeSimulation) {
                    simulationInstance.initializeSimulation(canvas);
                }
                
                // Set up initial variables
                if (simulationInstance.simulationMeta && simulationInstance.simulationMeta.variables) {
                    simulationInstance.simulationMeta.variables.forEach(variable => {
                        const defaultValue = variable.min || (variable.options && variable.options[0]) || 50;
                        currentVariables[variable.name] = defaultValue;
                        updateVariable(variable.name, defaultValue);
                    });
                }
                
                // Initial render
                if (simulationInstance.updateSimulation && canvas) {
                    simulationInstance.updateSimulation(currentVariables, canvas);
                }
            })();
        } catch (error) {
            document.body.innerHTML += '<div class="error">Error running simulation: ' + error.message + '</div>';
            console.error('Simulation error:', error);
        }
    </script>
</body>
</html>`;
  }, [metadata]);

  // Extract metadata when code changes
  useEffect(() => {
    if (simulationCode) {
      const meta = extractSimulationMeta(simulationCode);
      setExtractedMeta(meta);
    }
  }, [simulationCode, extractSimulationMeta]);

  const runSimulation = useCallback(() => {
    setError(null);
    setIsRunning(true);
    
    try {
      const html = generateHTML(simulationCode, extractedMeta);
      const iframe = iframeRef.current;
      
      if (iframe) {
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframe.src = url;
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setIsRunning(false);
    }
  }, [simulationCode, generateHTML, extractedMeta]);

  useEffect(() => {
    if (simulationCode && activeTab === 'preview') {
      runSimulation();
    }
  }, [simulationCode, activeTab, runSimulation]);

  const downloadHTML = () => {
    const html = generateHTML(simulationCode, extractedMeta);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractedMeta?.title?.replace(/[^a-zA-Z0-9]/g, '_') || metadata.subject}_simulation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!simulationCode) {
    return (
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <p className="text-gray-600">No simulation code to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('metadata')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'metadata'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Metadata
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'code'
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Code
        </button>
        
        {/* Action buttons */}
        <div className="ml-auto flex items-center space-x-2 px-4">
          {onEnhance && (
            <button
              onClick={onEnhance}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Enhance
            </button>
          )}
          <button
            onClick={downloadHTML}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Download HTML
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {isRunning && (
              <div className="text-center text-gray-600">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading simulation...</span>
              </div>
            )}
            
            <div className="border rounded-lg overflow-hidden" style={{ height: '700px' }}>
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                sandbox="allow-scripts"
                title="Simulation Preview"
              />
            </div>
          </div>
        )}

        {activeTab === 'metadata' && extractedMeta && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Simulation Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Title:</strong> {extractedMeta.title}</p>
                <p><strong>Subject:</strong> {extractedMeta.subject}</p>
                <p><strong>Grade Level:</strong> {extractedMeta.gradeLevel}</p>
                {extractedMeta.essentialQuestion && (
                  <p><strong>Essential Question:</strong> {extractedMeta.essentialQuestion}</p>
                )}
              </div>
            </div>

            {extractedMeta.learningObjectives?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Learning Objectives</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {extractedMeta.learningObjectives.map((obj, idx) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </div>
            )}

            {extractedMeta.variables?.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Interactive Variables</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {extractedMeta.variables.map((variable, idx) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded">
                      <p className="font-medium">{variable.name}</p>
                      <p className="text-sm text-gray-600">Type: {variable.type}</p>
                      {variable.type === 'slider' && (
                        <p className="text-sm text-gray-600">
                          Range: {variable.min} - {variable.max} (step: {variable.step})
                        </p>
                      )}
                      {variable.options && (
                        <p className="text-sm text-gray-600">
                          Options: {variable.options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {extractedMeta.safetyConsiderations && extractedMeta.safetyConsiderations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Safety Considerations</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {extractedMeta.safetyConsiderations.map((safety, idx) => (
                    <li key={idx}>{safety}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{simulationCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
