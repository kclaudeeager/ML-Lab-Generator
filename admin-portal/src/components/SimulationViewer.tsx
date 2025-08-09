'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SimulationMetadata {
  subject: string;
  grade_level: string;
  rendering_library: string;
  complexity_level: string;
  [key: string]: unknown;
}

interface SimulationViewerProps {
  simulationCode: string;
  metadata: SimulationMetadata;
}

export default function SimulationViewer({ simulationCode, metadata }: SimulationViewerProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const generateHTML = useCallback((code: string) => {
    const isP5js = metadata.rendering_library === 'p5js';
    const dependencies = isP5js 
      ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>'
      : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Science Simulation</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        canvas {
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        #simulation-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            max-width: 900px;
            width: 100%;
            margin: 20px auto;
        }
        #simulation-canvas {
            border: 1px solid #eee;
            border-radius: 4px;
            display: block;
            margin: 20px auto;
            background: white;
            max-width: 100%;
            height: auto;
        }
        #controls-container {
            margin-top: 15px;
        }
        .controls {
            margin: 20px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
        }
        .control-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 120px;
        }
        .control-group label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
        }
        input, button, select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background-color: #007bff;
            color: white;
            cursor: pointer;
            border: none;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .info-panel {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: 800px;
            width: 100%;
        }
        .info-panel h3 {
            margin: 0 0 10px 0;
            color: #333;
        }
        .info-panel p {
            margin: 5px 0;
            color: #666;
            font-size: 14px;
        }
        .error {
            color: #d32f2f;
            background-color: #ffebee;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
    </style>
    ${dependencies}
</head>
<body>
    <div class="info-panel">
        <h3>${metadata.subject.charAt(0).toUpperCase() + metadata.subject.slice(1)} Simulation</h3>
        <p><strong>Grade Level:</strong> ${metadata.grade_level}</p>
        <p><strong>Complexity:</strong> ${metadata.complexity_level}</p>
        <p><strong>Library:</strong> ${metadata.rendering_library}</p>
    </div>
    
    <div id="simulation-container">
        <canvas id="simulation-canvas" width="800" height="600"></canvas>
        <div id="controls-container"></div>
    </div>
    
    <script>
        try {
            // Execute the simulation code
            ${code}
            
            // Mount the simulation after the code is loaded
            const canvas = document.getElementById('simulation-canvas');
            const container = document.getElementById('simulation-container');
            
            if (canvas && typeof window.mountSimulation === 'function') {
                // Default variables for the simulation
                const defaultVars = {
                    concentration: 0.1,
                    temperature: 298,
                    pH: 7,
                    pOH: 7,
                    indicatorColor: 'green'
                };
                
                // Mount the simulation
                const result = window.mountSimulation(canvas, defaultVars);
                console.log('Simulation mounted successfully:', result);
                
                // Add basic controls if the simulation meta is available
                if (typeof window.simulationMeta !== 'undefined' && window.simulationMeta.variables) {
                    const controlsContainer = document.getElementById('controls-container');
                    const controlsHTML = window.simulationMeta.variables.map(variable => {
                        if (variable.type === 'slider') {
                            return \`
                                <div style="margin: 10px 0;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">\${variable.name}: <span id="\${variable.name}-value">\${variable.min || 0}</span></label>
                                    <input type="range" 
                                           id="\${variable.name}-input"
                                           min="\${variable.min || 0}" 
                                           max="\${variable.max || 100}" 
                                           step="\${variable.step || 1}" 
                                           value="\${variable.min || 0}"
                                           style="width: 100%;"
                                           oninput="
                                               document.getElementById('\${variable.name}-value').textContent = this.value;
                                               const newVars = {...defaultVars, [\${variable.name}]: parseFloat(this.value)};
                                               const newResult = window.runSimulation(newVars);
                                               window.updateSimulation(newResult, canvas);
                                               window.renderVisualization(newResult, canvas);
                                           ">
                                </div>
                            \`;
                        }
                        return '';
                    }).join('');
                    
                    if (controlsHTML && controlsContainer) {
                        controlsContainer.innerHTML = \`
                            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                                <h4 style="margin-top: 0;">Controls</h4>
                                \${controlsHTML}
                            </div>
                        \`;
                    }
                }
            } else {
                console.error('Canvas element or mountSimulation function not found');
                console.log('Available functions:', Object.keys(window).filter(key => key.includes('simulation') || key.includes('Simulation')));
                document.getElementById('simulation-container').innerHTML = '<div class="error">Failed to initialize simulation: Canvas or mount function not available</div>';
            }
        } catch (error) {
            document.body.innerHTML += '<div class="error">Error running simulation: ' + error.message + '</div>';
            console.error('Simulation error:', error);
        }
    </script>
</body>
</html>`;
  }, [metadata]);

  const runSimulation = useCallback(() => {
    setError(null);
    setIsRunning(true);
    
    try {
      const html = generateHTML(simulationCode);
      const iframe = iframeRef.current;
      
      if (iframe) {
        // Create a blob URL for the HTML content
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        iframe.src = url;
        
        // Clean up the blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run simulation');
    } finally {
      setIsRunning(false);
    }
  }, [simulationCode, generateHTML]);

  useEffect(() => {
    if (simulationCode && activeTab === 'preview') {
      runSimulation();
    }
  }, [simulationCode, activeTab, runSimulation]);

  const downloadHTML = () => {
    const html = generateHTML(simulationCode);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata.subject}_simulation.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(simulationCode);
      // You could add a toast notification here
      alert('Simulation code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
      alert('Failed to copy code to clipboard');
    }
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
          <button
            onClick={downloadHTML}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Download HTML
          </button>
          <button
            onClick={copyCode}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Copy Code
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'preview' ? (
          <div className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <strong>Error:</strong> {error}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">Simulation Preview</h3>
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {isRunning ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                ref={iframeRef}
                className="w-full h-96"
                title="Simulation Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p><strong>Note:</strong> This simulation runs in a sandboxed environment for security.</p>
              <p>If the simulation doesn&apos;t load properly, try refreshing or check the code tab for errors.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">TypeScript Code</h3>
              <div className="text-sm text-gray-600">
                {simulationCode.split('\n').length} lines
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg overflow-auto">
              <pre className="p-4 text-sm text-gray-100 overflow-x-auto">
                <code>{simulationCode}</code>
              </pre>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              <p><strong>Instructions:</strong></p>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>This TypeScript code is designed to run in a web browser</li>
                <li>It uses {metadata.rendering_library} for rendering</li>
                <li>Save as an HTML file with appropriate dependencies included</li>
                <li>The code is sandboxed and should be safe for educational use</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
