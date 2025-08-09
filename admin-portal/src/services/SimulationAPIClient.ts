import { CompilationResult, SimulationMetadata, SimulationResponse } from './types/simulation';

export default class SimulationAPIClient {
  private static readonly BASE_URL = '/api';
  private static readonly AUTH_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:admin')
  };

  private static async fetchWithAuth(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
    const response = await fetch(`${this.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.AUTH_HEADERS,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || 'API request failed');
    }

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
  ): Promise<CompilationResult> {
    return this.fetchWithAuth('/compile_typescript', {
      typescript_code: code,
      ...options
    }) as Promise<CompilationResult>;
  }

  static async generateSimulation(
    markdownContent: string,
    metadata: SimulationMetadata
  ): Promise<SimulationResponse> {
    return this.fetchWithAuth('/convert_markdown_to_simulation', {
      markdown_content: markdownContent,
      ...metadata
    }) as Promise<SimulationResponse>;
  }

  static async enhanceSimulation(
    code: string,
    enhancements: string[]
  ): Promise<SimulationResponse> {
    return this.fetchWithAuth('/enhance_simulation_interactivity', {
      simulation_code: code,
      enhancement_goals: enhancements
    }) as Promise<SimulationResponse>;
  }

  static async optimizeSimulation(
    code: string,
    platform: 'desktop' | 'mobile' | 'tablet' | 'all',
    goals: string[]
  ): Promise<SimulationResponse> {
    return this.fetchWithAuth('/optimize_simulation_performance', {
      simulation_code: code,
      target_platform: platform,
      performance_goals: goals
    }) as Promise<SimulationResponse>;
  }
}
