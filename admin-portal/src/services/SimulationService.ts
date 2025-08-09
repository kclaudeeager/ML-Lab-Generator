export interface SimulationMetadata {
  subject: string;
  grade_level: string;
  rendering_library: string;
  complexity_level: string;
  [key: string]: unknown;
}

export interface CompileResult {
  success: boolean;
  compiled_code: string;
  source_map?: string;
  diagnostics: Array<{
    line: number;
    column: number;
    message: string;
    severity: string;
  }>;
}

export interface SimulationTemplate {
  code: string;
  metadata: SimulationMetadata;
}

class SimulationService {
  private static readonly API_BASE = '/api';
  private static readonly AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:admin')
  };

  static async convertMarkdownToSimulation(
    markdown: string,
    options: {
      subject: string;
      grade_level: string;
      rendering_library?: 'canvas' | 'p5js' | 'vanilla';
      complexity_level?: 'basic' | 'intermediate' | 'advanced';
    }
  ) {
    const response = await fetch(`${this.API_BASE}/convert_markdown_to_simulation`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        markdown_content: markdown,
        ...options
      })
    });

    if (!response.ok) throw new Error('Failed to convert markdown to simulation');
    return response.json();
  }

  static async enhanceSimulation(
    code: string,
    enhancementGoals: string[]
  ) {
    const response = await fetch(`${this.API_BASE}/enhance_simulation_interactivity`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        simulation_code: code,
        enhancement_goals: enhancementGoals
      })
    });

    if (!response.ok) throw new Error('Failed to enhance simulation');
    return response.json();
  }

  static async optimizePerformance(
    code: string,
    options: {
      target_platform?: 'desktop' | 'mobile' | 'tablet' | 'all';
      performance_goals?: string[];
    }
  ) {
    const response = await fetch(`${this.API_BASE}/optimize_simulation_performance`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        simulation_code: code,
        ...options
      })
    });

    if (!response.ok) throw new Error('Failed to optimize simulation');
    return response.json();
  }

  static async getTemplate(
    subject: string,
    labType: string,
    customizationLevel: 'basic' | 'customized' | 'advanced' = 'basic'
  ): Promise<SimulationTemplate> {
    const response = await fetch(`${this.API_BASE}/get_simulation_template`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        subject,
        lab_type: labType,
        customization_level: customizationLevel
      })
    });

    if (!response.ok) throw new Error('Failed to get simulation template');
    return response.json();
  }

  static async compileTypeScript(
    code: string,
    options: {
      target?: string;
      module?: string;
      strict?: boolean;
      include_source_map?: boolean;
    } = {}
  ): Promise<CompileResult> {
    const response = await fetch(`${this.API_BASE}/compile_typescript`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        typescript_code: code,
        ...options
      })
    });

    if (!response.ok) throw new Error('Failed to compile TypeScript');
    return response.json();
  }

  static async generateAssessment(
    code: string,
    options: {
      assessment_type: 'formative' | 'summative' | 'diagnostic' | 'adaptive';
      difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
    }
  ) {
    const response = await fetch(`${this.API_BASE}/generate_simulation_assessment`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify({
        simulation_code: code,
        ...options
      })
    });

    if (!response.ok) throw new Error('Failed to generate assessment');
    return response.json();
  }
}

export default SimulationService;
