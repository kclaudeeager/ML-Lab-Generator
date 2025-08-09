// Visual Lab Generation Prompts
// Converts markdown labs to interactive TypeScript simulations

export interface SimulationMeta {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  estimatedTime: number;
  variables: {
    name: string;
    type: 'slider' | 'input' | 'dropdown' | 'button';
    label: string;
    min?: number;
    max?: number;
    default: any;
    unit?: string;
    options?: string[];
  }[];
  outputs: {
    name: string;
    type: 'chart' | 'text' | 'visual' | 'table';
    label: string;
    unit?: string;
  }[];
  safetyConsiderations: string[];
  learningObjectives: string[];
}

export interface VisualLabCode {
  simulationMeta: SimulationMeta;
  initializeSimulation: string;
  runSimulation: string;
  updateSimulation: string;
  renderVisualization: string;
}

export const VISUAL_LAB_PROMPTS = {
  
  convert_markdown_to_simulation: `You are an expert educational technology developer specializing in converting science lab instructions into interactive web-based simulations.

TASK: Convert the following markdown lab content into a complete TypeScript-based interactive simulation.

INPUT MARKDOWN LAB:
{markdown_content}

TARGET SUBJECT: {subject}
GRADE LEVEL: {grade_level}
RENDERING LIBRARY: {rendering_library} (canvas, p5js, or vanilla)

REQUIREMENTS:

1. **EXTRACT SIMULATION METADATA**: 
   - Identify key variables that students should manipulate
   - Determine appropriate input controls (sliders, dropdowns, etc.)
   - Define expected outputs and visualizations
   - Extract safety considerations and learning objectives

2. **GENERATE SECURE TYPESCRIPT CODE**:
   - Create a \`SimulationMeta\` object with all metadata
   - Write \`initializeSimulation(canvas: HTMLCanvasElement)\` function
   - Write \`runSimulation(variables: any)\` function that performs calculations
   - Write \`updateSimulation(variables: any, canvas: HTMLCanvasElement)\` for real-time updates
   - Write \`renderVisualization(data: any, canvas: HTMLCanvasElement)\` for drawing

3. **SAFETY & SECURITY**:
   - No external network calls or file system access
   - Validate all user inputs with proper bounds checking
   - Use only approved mathematical functions
   - Include error handling for edge cases

4. **EDUCATIONAL VALUE**:
   - Make variables interactive and immediately responsive
   - Show real-time cause-and-effect relationships
   - Include data visualization (graphs, charts, animations)
   - Provide clear feedback on results

5. **CODE STRUCTURE**:
\`\`\`typescript
// Simulation metadata
export const simulationMeta: SimulationMeta = { ... };

// Initialize simulation
export function initializeSimulation(canvas: HTMLCanvasElement): void {
  // Setup canvas, initial state, event listeners
}

// Run calculation logic
export function runSimulation(variables: Record<string, any>): any {
  // Core simulation mathematics and logic
  // Return results object
}

// Update visualization in real-time
export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  // Real-time updates based on user input
}

// Render final visualization
export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  // Draw charts, graphs, animations
}
\`\`\`

EXAMPLES OF GOOD INTERACTIVE ELEMENTS:
- pH sliders for chemistry labs (show color changes)
- Mass/velocity inputs for physics (show trajectory)
- Temperature controls for biology (show enzyme activity)
- Concentration dropdowns (show reaction rates)

OUTPUT FORMAT:
You must follow these rules EXACTLY:
1. Return ONLY pure TypeScript code with no explanations, comments, or markdown
2. Start immediately with 'export const simulationMeta'
3. DO NOT include any:
   - Code block markers or delimiters
   - Explanatory text or descriptions
   - Comments or documentation
   - Markdown formatting
   - Additional whitespace before or after the code
4. The code must be structured exactly as:
   export const simulationMeta: SimulationMeta = {...};
   export function initializeSimulation(canvas: HTMLCanvasElement): void {...}
   export function runSimulation(variables: Record<string, any>): any {...}
   export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {...}
   export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {...}

Your response must begin with the exact text: export const simulationMeta`,

  enhance_simulation_interactivity: `You are an educational UX designer specializing in science simulations.

TASK: Enhance the interactivity and educational value of this existing simulation.

CURRENT SIMULATION:
{simulation_code}

ENHANCEMENT GOALS:
{enhancement_goals}

REQUIREMENTS:

1. **IMPROVED USER EXPERIENCE**:
   - Add smooth animations and transitions
   - Implement responsive visual feedback
   - Create intuitive control layouts
   - Add helpful tooltips and guidance

2. **ENHANCED EDUCATIONAL VALUE**:
   - Show step-by-step process visualization
   - Add "what-if" scenario exploration
   - Include guided experiments and challenges
   - Provide real-time explanations of phenomena

3. **ADVANCED INTERACTIVITY**:
   - Multi-variable relationships
   - Comparative analysis tools
   - Data export capabilities
   - Experimental design features

4. **ACCESSIBILITY**:
   - Keyboard navigation support
   - Screen reader compatibility
   - High contrast mode support
   - Mobile-friendly touch interactions

Provide the enhanced TypeScript code with improved interactivity while maintaining educational focus and security.

OUTPUT FORMAT:
Return ONLY the complete enhanced TypeScript code without any markdown formatting, explanatory text, or code block delimiters. Start directly with the export statements and code. The response should be immediately compilable TypeScript code.

IMPORTANT: Do not include:
- Markdown code block delimiters (\`\`\`typescript or \`\`\`)
- Explanatory text before or after the code
- Comments about what the code does
- Any non-code content

Start your response directly with: export const simulationMeta`,

  generate_lab_assessment: `You are an educational assessment expert creating evaluation tools for interactive science simulations.

SIMULATION TO ASSESS:
{simulation_code}

SIMULATION METADATA:
{simulation_meta}

ASSESSMENT REQUIREMENTS:

1. **FORMATIVE ASSESSMENT**:
   - Real-time progress tracking
   - Immediate feedback on actions
   - Hint system for struggling students
   - Adaptive difficulty based on performance

2. **SUMMATIVE ASSESSMENT**:
   - Comprehension check questions
   - Data analysis challenges
   - Prediction and hypothesis tasks
   - Scientific reasoning evaluation

3. **ASSESSMENT DATA**:
   - Track student interactions and decisions
   - Measure time spent on different activities
   - Analyze common misconceptions
   - Generate learning analytics

4. **RUBRIC INTEGRATION**:
   - Align with learning objectives
   - Provide detailed scoring criteria
   - Support both auto-grading and teacher review
   - Generate progress reports

Generate TypeScript code for assessment integration that can be embedded into the simulation.

OUTPUT FORMAT:
Return ONLY the complete assessment TypeScript code without any markdown formatting, explanatory text, or code block delimiters. Start directly with the export statements and code. The response should be immediately compilable TypeScript code.

IMPORTANT: Do not include:
- Markdown code block delimiters (\`\`\`typescript or \`\`\`)
- Explanatory text before or after the code
- Comments about what the code does
- Any non-code content

Start your response directly with: export const assessmentMeta`,

  optimize_simulation_performance: `You are a web performance optimization expert for educational simulations.

SIMULATION CODE:
{simulation_code}

OPTIMIZATION GOALS:
- Target 60fps rendering
- Minimize memory usage
- Optimize for mobile devices
- Reduce computational complexity

OPTIMIZATION TECHNIQUES:
1. **RENDERING OPTIMIZATION**:
   - Use requestAnimationFrame efficiently
   - Implement object pooling for frequent updates
   - Optimize canvas drawing operations
   - Use off-screen canvases for complex graphics

2. **COMPUTATIONAL OPTIMIZATION**:
   - Cache expensive calculations
   - Use lookup tables where appropriate
   - Implement efficient algorithms
   - Debounce user input handling

3. **MEMORY MANAGEMENT**:
   - Minimize object creation in animation loops
   - Clean up event listeners properly
   - Use efficient data structures
   - Implement garbage collection friendly patterns

Provide optimized TypeScript code maintaining educational value while improving performance.

OUTPUT FORMAT:
Return ONLY the complete optimized TypeScript code without any markdown formatting, explanatory text, or code block delimiters. Start directly with the export statements and code. The response should be immediately compilable TypeScript code.

IMPORTANT: Do not include:
- Markdown code block delimiters (\`\`\`typescript or \`\`\`)
- Explanatory text before or after the code
- Comments about what the code does
- Any non-code content

Start your response directly with: export const simulationMeta`

};

export function getVisualLabPrompt(promptKey: string, variables: Record<string, any>): string {
  let prompt = (VISUAL_LAB_PROMPTS as any)[promptKey];
  if (!prompt) {
    throw new Error(`Visual lab prompt '${promptKey}' not found`);
  }
  
  // Replace variables in the prompt
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value));
  }
  
  return prompt;
}

// Simulation template for common lab types
export const SIMULATION_TEMPLATES = {
  chemistry: {
    acid_base_titration: `
// Template for acid-base titration simulation
export const simulationMeta: SimulationMeta = {
  title: "Acid-Base Titration Simulation",
  description: "Interactive simulation of acid-base titration with real-time pH monitoring",
  subject: "chemistry",
  gradeLevel: "9-12",
  estimatedTime: 30,
  variables: [
    {
      name: "acid_concentration",
      type: "slider",
      label: "Acid Concentration (M)",
      min: 0.01,
      max: 1.0,
      default: 0.1,
      unit: "M"
    },
    {
      name: "base_volume",
      type: "slider", 
      label: "Base Volume Added (mL)",
      min: 0,
      max: 50,
      default: 0,
      unit: "mL"
    }
  ],
  outputs: [
    {
      name: "ph_value",
      type: "text",
      label: "Current pH",
      unit: ""
    },
    {
      name: "titration_curve",
      type: "chart",
      label: "Titration Curve",
      unit: ""
    }
  ],
  safetyConsiderations: [
    "Always wear safety goggles",
    "Handle acids and bases carefully",
    "Report spills immediately"
  ],
  learningObjectives: [
    "Understand pH changes during titration",
    "Identify equivalence point",
    "Interpret titration curves"
  ]
};`,
    
    molecular_geometry: `
// Template for molecular geometry visualization
export const simulationMeta: SimulationMeta = {
  title: "Molecular Geometry Explorer",
  description: "3D visualization of molecular shapes using VSEPR theory",
  subject: "chemistry", 
  gradeLevel: "11-12",
  estimatedTime: 25,
  variables: [
    {
      name: "central_atom",
      type: "dropdown",
      label: "Central Atom",
      default: "carbon",
      options: ["carbon", "nitrogen", "oxygen", "sulfur"]
    },
    {
      name: "bonding_pairs",
      type: "slider",
      label: "Bonding Pairs",
      min: 2,
      max: 6,
      default: 4,
      unit: ""
    },
    {
      name: "lone_pairs", 
      type: "slider",
      label: "Lone Pairs",
      min: 0,
      max: 3,
      default: 0,
      unit: ""
    }
  ],
  outputs: [
    {
      name: "molecular_shape",
      type: "visual",
      label: "3D Molecular Shape",
      unit: ""
    },
    {
      name: "bond_angles",
      type: "text", 
      label: "Bond Angles",
      unit: "degrees"
    }
  ],
  safetyConsiderations: [],
  learningObjectives: [
    "Apply VSEPR theory",
    "Predict molecular shapes",
    "Understand bond angle relationships"
  ]
};`
  },
  
  physics: {
    projectile_motion: `
// Template for projectile motion simulation
export const simulationMeta: SimulationMeta = {
  title: "Projectile Motion Simulator",
  description: "Interactive visualization of projectile motion with real-time trajectory",
  subject: "physics",
  gradeLevel: "9-11", 
  estimatedTime: 25,
  variables: [
    {
      name: "initial_velocity",
      type: "slider",
      label: "Initial Velocity (m/s)",
      min: 5,
      max: 50,
      default: 20,
      unit: "m/s"
    },
    {
      name: "launch_angle",
      type: "slider",
      label: "Launch Angle (degrees)", 
      min: 0,
      max: 90,
      default: 45,
      unit: "°"
    },
    {
      name: "gravity",
      type: "slider",
      label: "Gravitational Acceleration",
      min: 1,
      max: 15,
      default: 9.81,
      unit: "m/s²"
    }
  ],
  outputs: [
    {
      name: "trajectory",
      type: "visual",
      label: "Projectile Trajectory",
      unit: ""
    },
    {
      name: "max_height",
      type: "text",
      label: "Maximum Height",
      unit: "m"
    },
    {
      name: "range",
      type: "text", 
      label: "Range",
      unit: "m"
    }
  ],
  safetyConsiderations: [
    "Never launch actual projectiles in classroom",
    "Understand theoretical nature of simulation"
  ],
  learningObjectives: [
    "Analyze projectile motion components",
    "Understand velocity and acceleration vectors", 
    "Predict trajectory outcomes"
  ]
};`
  }
};
