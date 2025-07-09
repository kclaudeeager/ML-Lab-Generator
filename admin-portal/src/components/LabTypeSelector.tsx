interface LabTypeSelectorProps {
  value: string;
  onTypeChange: (type: string) => void;
}

export default function LabTypeSelector({ value, onTypeChange }: LabTypeSelectorProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label>
        Lab Type:
        <select value={value} onChange={e => onTypeChange(e.target.value)} style={{ marginLeft: 12 }}>
          <option value="interactive">Interactive</option>
          <option value="gamified">Gamified</option>
          <option value="project-based">Project-Based</option>
        </select>
      </label>
    </div>
  );
}
