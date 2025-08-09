import React from 'react';
import { SimulationMetadata } from '../../services/types/simulation';

interface SimulationMetadataFormProps {
  metadata: SimulationMetadata;
  onChange: (metadata: SimulationMetadata) => void;
}

export default function SimulationMetadataForm({ metadata, onChange }: SimulationMetadataFormProps) {
  const handleChange = (field: keyof SimulationMetadata, value: string) => {
    onChange({
      ...metadata,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Configure Simulation</h3>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Rendering Library
          </label>
          <select
            value={metadata.rendering_library}
            onChange={(e) => handleChange('rendering_library', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="canvas">HTML Canvas</option>
            <option value="p5js">p5.js</option>
            <option value="vanilla">Vanilla TypeScript</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Complexity Level
          </label>
          <select
            value={metadata.complexity_level}
            onChange={(e) => handleChange('complexity_level', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Target Platform
          </label>
          <select
            value={metadata.target_platform || 'all'}
            onChange={(e) => handleChange('target_platform', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Platforms</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Assessment Type
          </label>
          <select
            value={metadata.assessment_type || 'formative'}
            onChange={(e) => handleChange('assessment_type', e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="formative">Formative</option>
            <option value="summative">Summative</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="adaptive">Adaptive</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md mt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Current Configuration</h4>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Subject</dt>
            <dd className="mt-1 text-sm text-gray-900">{metadata.subject}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Grade Level</dt>
            <dd className="mt-1 text-sm text-gray-900">{metadata.grade_level}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
