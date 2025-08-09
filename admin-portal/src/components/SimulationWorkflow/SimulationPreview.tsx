import React from 'react';
import { SimulationMetadata } from '../../services/types/simulation';

interface SimulationPreviewProps {
  code: string;
  metadata: SimulationMetadata;
}

export default function SimulationPreview({ code, metadata }: SimulationPreviewProps) {
  const generateHTML = () => {
    const isP5js = metadata.rendering_library === 'p5js';
    const dependencies = isP5js 
      ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>'
      : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.subject} Simulation</title>
  ${dependencies}
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #simulation-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      padding: 20px;
    }
    canvas {
      border: 1px solid #eee;
      border-radius: 4px;
    }
    .controls {
      margin-top: 15px;
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    button, input, select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    button {
      background: #4F46E5;
      color: white;
      border: none;
      cursor: pointer;
    }
    button:hover {
      background: #4338CA;
    }
  </style>
</head>
<body>
  <div id="simulation-container"></div>
  <script>
    ${code}
  </script>
</body>
</html>`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Simulation Preview</h3>
        <button
          onClick={() => {
            const html = generateHTML();
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${metadata.subject}_simulation.html`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Download HTML
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <iframe
          srcDoc={generateHTML()}
          className="w-full h-[600px]"
          title="Simulation Preview"
          sandbox="allow-scripts"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Simulation Details</h4>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <dt className="text-sm font-medium text-blue-700">Subject</dt>
            <dd className="mt-1 text-sm text-blue-900">{metadata.subject}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-blue-700">Grade Level</dt>
            <dd className="mt-1 text-sm text-blue-900">{metadata.grade_level}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-blue-700">Library</dt>
            <dd className="mt-1 text-sm text-blue-900">{metadata.rendering_library}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-blue-700">Complexity</dt>
            <dd className="mt-1 text-sm text-blue-900">{metadata.complexity_level}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
