export interface SimulationVariable {
  name: string;
  type: 'slider' | 'input' | 'select' | 'button';
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number | string | boolean;
  options?: string[];
  unit?: string;
}

export interface SimulationOutput {
  name: string;
  type: 'chart' | 'text' | 'visual' | 'table';
  label: string;
  unit?: string;
}

export interface SimulationMeta {
  title: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  time?: number;
  difficulty?: string;
  curriculumStandards?: string[];
  learningObjectives: string[];
  variables: SimulationVariable[];
  outputs?: SimulationOutput[];
  safetyConsiderations?: string[];
}

export interface SimulationMetadata {
  subject: string;
  grade_level: string;
  rendering_library: 'canvas' | 'p5js' | 'vanilla';
  complexity_level: 'basic' | 'intermediate' | 'advanced';
  target_platform?: 'desktop' | 'mobile' | 'tablet' | 'all';
  assessment_type?: 'formative' | 'summative' | 'diagnostic' | 'adaptive';
}

export interface CompilationDiagnostic {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CompilationResult {
  success: boolean;
  compiled_code: string;
  source_map?: string;
  diagnostics: CompilationDiagnostic[];
}

export interface SimulationResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}
