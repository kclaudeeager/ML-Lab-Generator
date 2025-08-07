interface LabTypeSelectorProps {
  value: string;
  onTypeChange: (type: string) => void;
}

export default function LabTypeSelector({ value, onTypeChange }: LabTypeSelectorProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label className="block font-semibold mb-2 text-cmu-red">
        Lab Category:
      </label>
      <select 
        value={value} 
        onChange={e => onTypeChange(e.target.value)} 
        className="w-full p-3 border border-cmu-light rounded-lg focus:ring-2 focus:ring-cmu-red focus:border-cmu-red"
      >
        <optgroup label="Machine Learning Labs">
          <option value="interactive">ML Interactive</option>
          <option value="gamified">ML Gamified</option>
          <option value="project-based">ML Project-Based</option>
        </optgroup>
        <optgroup label="Science Labs">
          <option value="science">Science Lab</option>
        </optgroup>
      </select>
    </div>
  );
}
