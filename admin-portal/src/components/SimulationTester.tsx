'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface SimulationTesterProps {
  simulationCode?: string;
  onTestComplete?: (results: TestResults) => void;
}

interface TestResults {
  success: boolean;
  compilationErrors: string[];
  runtimeErrors: string[];
  testResults: {
    passed: number;
    failed: number;
    details: string[];
  };
  performance: {
    initTime: number;
    renderTime: number;
    memoryUsage: string;
  };
  accessibility: {
    score: number;
    issues: string[];
  };
}

interface SimulationModule {
  simulationMeta?: {
    title: string;
    subject: string;
    gradeLevel: string;
    learningObjectives: string[];
    realWorldApplications: string[];
    essentialQuestion: string;
    variables: Record<string, unknown>;
    outputs: Array<{ type: string; label: string }>;
  };
  initializeSimulation?: (canvas: HTMLCanvasElement) => void;
  runSimulation?: (variables: Record<string, unknown>) => unknown;
  updateSimulation?: (variables: Record<string, unknown>, canvas: HTMLCanvasElement) => void;
  renderVisualization?: (data: unknown, canvas: HTMLCanvasElement) => void;
}

interface SimulationTesterProps {
  simulationCode?: string;
  onTestComplete?: (results: TestResults) => void;
}

interface TestResults {
  success: boolean;
  compilationErrors: string[];
  runtimeErrors: string[];
  testResults: {
    passed: number;
    failed: number;
    details: string[];
  };
  performance: {
    initTime: number;
    renderTime: number;
    memoryUsage: string;
  };
  accessibility: {
    score: number;
    issues: string[];
  };
}

interface SimulationModule {
  simulationMeta?: {
    title: string;
    subject: string;
    gradeLevel: string;
    learningObjectives: string[];
    realWorldApplications: string[];
    essentialQuestion: string;
    variables: Record<string, unknown>;
    outputs: Array<{ type: string; label: string }>;
  };
  initializeSimulation?: (canvas: HTMLCanvasElement) => void;
  runSimulation?: (variables: Record<string, unknown>) => unknown;
  updateSimulation?: (variables: Record<string, unknown>, canvas: HTMLCanvasElement) => void;
  renderVisualization?: (data: unknown, canvas: HTMLCanvasElement) => void;
}

export default function SimulationTester({ simulationCode, onTestComplete }: SimulationTesterProps) {
  const [code, setCode] = useState(simulationCode || '');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [simulationInstance, setSimulationInstance] = useState<SimulationModule | null>(null);
  const [activeTab, setActiveTab] = useState('code');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Default simulation code template
  const defaultCode = useCallback(() => `// Simulation metadata
export const simulationMeta = {
  title: "Sample Chemistry Lab",
  subject: "Chemistry",
  gradeLevel: "9-12",
  learningObjectives: ["Understand pH calculations"],
  realWorldApplications: ["Food preservation"],
  essentialQuestion: "How does pH affect chemical reactions?",
  variables: {
    concentration: {
      type: "number",
      min: 0.01,
      max: 1,
      step: 0.01,
      label: "Concentration (M)"
    }
  },
  outputs: [{ type: "number", label: "pH Value" }]
};

export function initializeSimulation(canvas) {
  canvas.width = 400;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  ctx.font = "14px Arial";
  ctx.fillText("Sample Simulation", 10, 30);
}

export function runSimulation(variables) {
  const concentration = variables.concentration || 0.1;
  const pHValue = -Math.log10(concentration);
  return { pHValue };
}

export function updateSimulation(variables, canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const results = runSimulation(variables);
  ctx.fillStyle = "black";
  ctx.font = "14px Arial";
  ctx.fillText(\`pH Value: \${results.pHValue.toFixed(2)}\`, 10, 30);
}

export function renderVisualization(data, canvas) {
  updateSimulation(data, canvas);
}`, []);

  useEffect(() => {
    if (!code) {
      setCode(defaultCode());
    }
  }, [code, defaultCode]);

  const compileAndTest = async () => {
    setIsRunning(true);
    const startTime = performance.now();

    try {
      const results: TestResults = {
        success: true,
        compilationErrors: [],
        runtimeErrors: [],
        testResults: { passed: 0, failed: 0, details: [] },
        performance: { initTime: 0, renderTime: 0, memoryUsage: '0 MB' },
        accessibility: { score: 0, issues: [] }
      };

      // Step 1: Enhanced syntax validation with better error reporting
      try {
        // Clean the code first
        const cleanedCode = code
          .replace(/export\s+/g, '')
          .replace(/import\s+.*from\s+.*/g, '')
          .trim();

        // Try to parse as function body
        new Function(cleanedCode);
        results.testResults.passed++;
        results.testResults.details.push('✅ Syntax validation passed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown syntax error';
        results.compilationErrors.push(`Syntax Error: ${errorMessage}`);
        results.testResults.failed++;
        results.testResults.details.push(`❌ Syntax validation failed: ${errorMessage}`);
        results.success = false;
      }

      // Step 2: Enhanced code execution with better error handling
      if (results.success) {
        try {
          const sandboxedCode = createSandboxedCode(code);
          console.log('Executing sandboxed code...');
          
          const simulationModule = new Function(sandboxedCode)() as SimulationModule;
          
          if (simulationModule) {
            setSimulationInstance(simulationModule);
            console.log('Simulation module loaded:', simulationModule);
            
            // Test required functions with detailed validation
            const requiredFunctions: (keyof SimulationModule)[] = ['initializeSimulation', 'runSimulation', 'updateSimulation', 'renderVisualization'];
            for (const funcName of requiredFunctions) {
              if (typeof simulationModule[funcName] === 'function') {
                results.testResults.passed++;
                results.testResults.details.push(`✅ ${funcName} function exists and is callable`);
              } else {
                results.testResults.failed++;
                results.testResults.details.push(`❌ ${funcName} function missing or not callable`);
                results.success = false;
              }
            }

            // Enhanced metadata validation
            if (simulationModule.simulationMeta) {
              const meta = simulationModule.simulationMeta;
              results.testResults.passed++;
              results.testResults.details.push('✅ Simulation metadata found');
              
              // Validate metadata structure with detailed checks
              const requiredFields = ['title', 'subject', 'gradeLevel'];
              const optionalFields = ['variables', 'outputs', 'learningObjectives'];
              
              for (const field of requiredFields) {
                if (meta[field as keyof typeof meta]) {
                  results.testResults.passed++;
                  results.testResults.details.push(`✅ Required metadata field '${field}' present`);
                } else {
                  results.testResults.failed++;
                  results.testResults.details.push(`❌ Required metadata field '${field}' missing`);
                }
              }

              for (const field of optionalFields) {
                if (meta[field as keyof typeof meta]) {
                  results.testResults.passed++;
                  results.testResults.details.push(`✅ Optional metadata field '${field}' present`);
                }
              }
            } else {
              results.testResults.failed++;
              results.testResults.details.push('❌ Simulation metadata missing');
            }

            // Enhanced canvas rendering with error recovery
            if (canvasRef.current) {
              try {
                const canvas = canvasRef.current;
                console.log('Testing canvas initialization...');
                
                // Test initialization
                const initStart = performance.now();
                simulationModule.initializeSimulation?.(canvas);
                results.performance.initTime = performance.now() - initStart;
                
                console.log('Testing simulation run...');
                // Test simulation run with sample data
                const testVariables = { concentration: 0.1, temperature: 25, volume: 100 };
                const simulationResults = simulationModule.runSimulation?.(testVariables);
                
                console.log('Simulation results:', simulationResults);
                
                console.log('Testing canvas update...');
                // Test canvas update
                const renderStart = performance.now();
                simulationModule.updateSimulation?.(testVariables, canvas);
                results.performance.renderTime = performance.now() - renderStart;
                
                // Test visualization rendering
                if (simulationResults) {
                  simulationModule.renderVisualization?.(simulationResults, canvas);
                }
                
                results.testResults.passed++;
                results.testResults.details.push('✅ Canvas rendering and simulation execution successful');
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown canvas error';
                results.runtimeErrors.push(`Canvas Error: ${errorMessage}`);
                results.testResults.failed++;
                results.testResults.details.push(`❌ Canvas rendering failed: ${errorMessage}`);
                console.error('Canvas error:', error);
              }
            }

            // Test simulation with different variable sets
            try {
              const testCases = [
                { concentration: 0.01 },
                { concentration: 0.1 },
                { concentration: 1.0 },
                { temperature: 0 },
                { temperature: 100 }
              ];

              for (const testCase of testCases) {
                const result = simulationModule.runSimulation?.(testCase);
                if (result !== undefined && result !== null) {
                  results.testResults.passed++;
                  results.testResults.details.push(`✅ Test case ${JSON.stringify(testCase)} executed successfully`);
                }
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown test error';
              results.runtimeErrors.push(`Test Case Error: ${errorMessage}`);
              results.testResults.failed++;
              results.testResults.details.push(`❌ Test cases failed: ${errorMessage}`);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown runtime error';
          results.runtimeErrors.push(`Runtime Error: ${errorMessage}`);
          results.testResults.failed++;
          results.testResults.details.push(`❌ Code execution failed: ${errorMessage}`);
          results.success = false;
          console.error('Runtime error:', error);
        }
      }

      // Step 3: Enhanced accessibility testing
      if (canvasRef.current) {
        const accessibilityScore = testAccessibility(canvasRef.current);
        results.accessibility = accessibilityScore;
      }

      // Step 4: Enhanced performance metrics
      const memoryInfo = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;
      results.performance.memoryUsage = memoryInfo 
        ? `${(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`
        : 'N/A';

      const totalTime = performance.now() - startTime;
      results.testResults.details.push(`⏱️ Total test time: ${totalTime.toFixed(2)}ms`);

      setTestResults(results);
      onTestComplete?.(results);

    } catch (error) {
      console.error('Testing failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown fatal error';
      setTestResults({
        success: false,
        compilationErrors: [`Fatal Error: ${errorMessage}`],
        runtimeErrors: [],
        testResults: { passed: 0, failed: 1, details: ['❌ Testing framework failed'] },
        performance: { initTime: 0, renderTime: 0, memoryUsage: '0 MB' },
        accessibility: { score: 0, issues: ['Testing failed'] }
      });
    } finally {
      setIsRunning(false);
    }
  };

  const createSandboxedCode = (code: string) => {
    // Enhanced code cleaning to handle various input formats
    let cleanedCode = code.trim();
    
    // Remove markdown code blocks if present
    cleanedCode = cleanedCode.replace(/```typescript\s*/g, '');
    cleanedCode = cleanedCode.replace(/```ts\s*/g, '');
    cleanedCode = cleanedCode.replace(/```\s*/g, '');
    
    // Remove export statements but preserve the rest
    cleanedCode = cleanedCode.replace(/export\s+/g, '');
    
    // Remove import statements
    cleanedCode = cleanedCode.replace(/import\s+.*from\s+.*['"];?\s*/g, '');
    
    // Remove any leading explanatory text before the actual code
    const codeStartPattern = /(const\s+simulationMeta|function\s+initializeSimulation|class\s+|interface\s+)/;
    const match = cleanedCode.match(codeStartPattern);
    if (match && match.index !== undefined) {
      cleanedCode = cleanedCode.substring(match.index);
    }

    return `
      try {
        // Create a safe execution environment
        const console = { log: window.console.log.bind(window.console) };
        const Math = window.Math;
        
        // Execute the cleaned simulation code
        ${cleanedCode}
        
        // Return the simulation module interface
        return {
          simulationMeta: typeof simulationMeta !== 'undefined' ? simulationMeta : null,
          initializeSimulation: typeof initializeSimulation !== 'undefined' ? initializeSimulation : null,
          runSimulation: typeof runSimulation !== 'undefined' ? runSimulation : null,
          updateSimulation: typeof updateSimulation !== 'undefined' ? updateSimulation : null,
          renderVisualization: typeof renderVisualization !== 'undefined' ? renderVisualization : null
        };
      } catch (error) {
        console.error('Sandbox execution error:', error);
        throw new Error('Code execution failed: ' + error.message);
      }
    `;
  };

  const testAccessibility = (canvas: HTMLCanvasElement) => {
    const issues = [];
    let score = 100;

    // Check for aria-label
    if (!canvas.getAttribute('aria-label')) {
      issues.push('Canvas missing aria-label attribute');
      score -= 20;
    }

    // Check for keyboard navigation
    const hasKeyboardHandlers = code.includes('keydown') || code.includes('keyboard');
    if (!hasKeyboardHandlers) {
      issues.push('No keyboard navigation detected');
      score -= 15;
    }

    // Check for high contrast support
    const hasHighContrast = code.includes('high-contrast') || code.includes('contrast');
    if (!hasHighContrast) {
      issues.push('No high contrast support detected');
      score -= 15;
    }

    // Check for mobile support
    const hasMobileSupport = code.includes('touch') || code.includes('mobile');
    if (!hasMobileSupport) {
      issues.push('No mobile touch support detected');
      score -= 10;
    }

    return { score: Math.max(0, score), issues };
  };

  const runInteractiveTest = () => {
    if (simulationInstance && canvasRef.current) {
      try {
        console.log('Starting interactive test with simulation instance:', simulationInstance);
        
        // Get metadata to understand available variables
        const meta = simulationInstance.simulationMeta;
        let testVariables: Record<string, unknown>[] = [];

        if (meta && meta.variables) {
          // Generate test cases based on metadata
          if (Array.isArray(meta.variables)) {
            // Handle array format
            testVariables = [
              ...meta.variables.map(variable => ({ [variable.name]: variable.default || 0.5 })),
              ...meta.variables.map(variable => ({ [variable.name]: variable.min || 0.1 })),
              ...meta.variables.map(variable => ({ [variable.name]: variable.max || 1.0 }))
            ];
          } else {
            // Handle object format
            const variableNames = Object.keys(meta.variables);
            testVariables = [
              ...variableNames.map(name => ({ [name]: 0.1 })),
              ...variableNames.map(name => ({ [name]: 0.5 })),
              ...variableNames.map(name => ({ [name]: 1.0 }))
            ];
          }
        } else {
          // Default test cases if no metadata
          testVariables = [
            { concentration: 0.01, temperature: 20 },
            { concentration: 0.1, temperature: 25 },
            { concentration: 1.0, temperature: 30 },
            { volume: 50, pressure: 1 },
            { volume: 100, pressure: 2 }
          ];
        }

        console.log('Running interactive test with variables:', testVariables);

        // Run tests with animation
        testVariables.forEach((vars, index) => {
          setTimeout(() => {
            if (simulationInstance && canvasRef.current) {
              console.log(`Test ${index + 1}:`, vars);
              
              try {
                // Run the simulation
                const results = simulationInstance.runSimulation?.(vars);
                console.log(`Test ${index + 1} results:`, results);
                
                // Update the visualization
                simulationInstance.updateSimulation?.(vars, canvasRef.current);
                
                // Also try renderVisualization if available
                if (results && simulationInstance.renderVisualization) {
                  simulationInstance.renderVisualization(results, canvasRef.current);
                }
                
                // Add a visual indicator of the test
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#007bff';
                  ctx.font = '12px Arial';
                  ctx.fillText(`Test ${index + 1}/${testVariables.length}`, 10, canvasRef.current.height - 10);
                }
              } catch (error) {
                console.error(`Test ${index + 1} failed:`, error);
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = 'red';
                  ctx.font = '12px Arial';
                  ctx.fillText(`Test ${index + 1} Error: ${error}`, 10, 20);
                }
              }
            }
          }, index * 1500); // Slower animation for better visibility
        });
        
        // Reset to initial state after all tests
        setTimeout(() => {
          if (simulationInstance && canvasRef.current) {
            console.log('Resetting to initial state');
            simulationInstance.initializeSimulation?.(canvasRef.current);
          }
        }, testVariables.length * 1500 + 1000);
        
      } catch (error) {
        console.error('Interactive test failed:', error);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'red';
          ctx.font = '14px Arial';
          ctx.fillText('Interactive test failed: ' + error, 10, 20);
        }
      }
    } else {
      console.warn('No simulation instance available for interactive test');
    }
  };

  const exportResults = () => {
    if (testResults) {
      const report = {
        timestamp: new Date().toISOString(),
        testResults,
        code: code.substring(0, 200) + '...' // Truncated for export
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'simulation-test-report.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">🧪 Simulation Testing & Rendering Environment</h2>
        </div>
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex border-b mb-6">
            {[
              { id: 'code', label: 'Code Editor' },
              { id: 'preview', label: 'Live Preview' },
              { id: 'tests', label: 'Test Results' },
              { id: 'reports', label: 'Reports' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code Editor Tab */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TypeScript Simulation Code:</label>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-96 p-3 border rounded-md font-mono text-sm resize-none"
                  placeholder="Paste your TypeScript simulation code here..."
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={compileAndTest} 
                  disabled={isRunning}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRunning ? '🔄 Testing...' : '🚀 Compile & Test'}
                </button>
                <button 
                  onClick={runInteractiveTest} 
                  disabled={!simulationInstance}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  🎮 Interactive Test
                </button>
                <button 
                  onClick={exportResults} 
                  disabled={!testResults}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  📊 Export Report
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Live Simulation Preview</h3>
                  {simulationInstance?.simulationMeta && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Title:</strong> {simulationInstance.simulationMeta.title}</p>
                      <p><strong>Subject:</strong> {simulationInstance.simulationMeta.subject}</p>
                      <p><strong>Grade Level:</strong> {simulationInstance.simulationMeta.gradeLevel}</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div ref={previewContainerRef} className="border rounded-lg p-4 bg-gray-50">
                    <canvas 
                      ref={canvasRef} 
                      className="border bg-white rounded"
                      width={400} 
                      height={200}
                    />
                    <div className="mt-4 space-y-2">
                      <div className="text-sm text-gray-600">
                        Canvas will display simulation output after compilation
                      </div>
                      
                      {/* Interactive Controls */}
                      {simulationInstance && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm">Test Variables:</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium mb-1">Concentration</label>
                              <input 
                                type="range" 
                                min="0.01" 
                                max="1" 
                                step="0.01" 
                                defaultValue="0.1"
                                className="w-full"
                                onChange={(e) => {
                                  if (simulationInstance && canvasRef.current) {
                                    const value = parseFloat(e.target.value);
                                    simulationInstance.updateSimulation?.({ concentration: value }, canvasRef.current);
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500">0.01 - 1.0 M</span>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Temperature</label>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                step="1" 
                                defaultValue="25"
                                className="w-full"
                                onChange={(e) => {
                                  if (simulationInstance && canvasRef.current) {
                                    const value = parseFloat(e.target.value);
                                    simulationInstance.updateSimulation?.({ temperature: value }, canvasRef.current);
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500">0 - 100 °C</span>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Volume</label>
                              <input 
                                type="range" 
                                min="10" 
                                max="200" 
                                step="5" 
                                defaultValue="100"
                                className="w-full"
                                onChange={(e) => {
                                  if (simulationInstance && canvasRef.current) {
                                    const value = parseFloat(e.target.value);
                                    simulationInstance.updateSimulation?.({ volume: value }, canvasRef.current);
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500">10 - 200 mL</span>
                            </div>
                            <div>
                              <label className="block text-xs font-medium mb-1">Pressure</label>
                              <input 
                                type="range" 
                                min="0.5" 
                                max="3" 
                                step="0.1" 
                                defaultValue="1"
                                className="w-full"
                                onChange={(e) => {
                                  if (simulationInstance && canvasRef.current) {
                                    const value = parseFloat(e.target.value);
                                    simulationInstance.updateSimulation?.({ pressure: value }, canvasRef.current);
                                  }
                                }}
                              />
                              <span className="text-xs text-gray-500">0.5 - 3.0 atm</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <button 
                              onClick={() => {
                                if (simulationInstance && canvasRef.current) {
                                  simulationInstance.initializeSimulation?.(canvasRef.current);
                                }
                              }}
                              className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                              Reset
                            </button>
                            <button 
                              onClick={runInteractiveTest}
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                              Run Auto Test
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Results Tab */}
          {activeTab === 'tests' && testResults && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow border">
                <div className={`p-4 border-b ${testResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${testResults.success ? 'text-green-600' : 'text-red-600'}`}>
                    {testResults.success ? '✅' : '❌'} Test Results
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="font-semibold text-green-800">Passed: {testResults.testResults.passed}</div>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <div className="font-semibold text-red-800">Failed: {testResults.testResults.failed}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Test Details:</h4>
                    <ul className="space-y-1">
                      {testResults.testResults.details.map((detail, index) => (
                        <li key={index} className="text-sm">{detail}</li>
                      ))}
                    </ul>
                  </div>

                  {testResults.compilationErrors.length > 0 && (
                    <div className="bg-red-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-red-800">Compilation Errors:</h4>
                      <ul className="mt-2 space-y-1">
                        {testResults.compilationErrors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {testResults.runtimeErrors.length > 0 && (
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <h4 className="font-semibold text-orange-800">Runtime Errors:</h4>
                      <ul className="mt-2 space-y-1">
                        {testResults.runtimeErrors.map((error, index) => (
                          <li key={index} className="text-sm text-orange-700">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && testResults && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Performance Metrics</h3>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {testResults.performance.initTime.toFixed(2)}ms
                      </div>
                      <div className="text-sm text-blue-800">Initialization Time</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {testResults.performance.renderTime.toFixed(2)}ms
                      </div>
                      <div className="text-sm text-green-800">Render Time</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {testResults.performance.memoryUsage}
                      </div>
                      <div className="text-sm text-purple-800">Memory Usage</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-semibold">Accessibility Score</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {testResults.accessibility.score}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${testResults.accessibility.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {testResults.accessibility.issues.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Accessibility Issues:</h4>
                      <ul className="mt-2 space-y-1">
                        {testResults.accessibility.issues.map((issue, index) => (
                          <li key={index} className="text-sm text-orange-700">⚠️ {issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
