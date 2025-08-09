// Visual Lab Generation Prompts
// Converts markdown labs to interactive TypeScript simulations

export interface SimulationMeta {
  title: string;
  subject: string;
  gradeLevel: string;
  safetyConsiderations?: string[];
  learningObjectives: string[];
  realWorldApplications?: string[];
  essentialQuestion?: string;
  variables: Array<{
    name: string;
    type: string;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
  }>;
  outputs?: Array<{
    name: string;
    type?: string;
    unit?: string;
    description?: string;
  }>;
}

export interface VisualLabCode {
  simulationMeta: SimulationMeta;
  initializeSimulation: string;
  runSimulation: string;
  updateSimulation: string;
  renderVisualization: string;
}

export const VISUAL_LAB_PROMPTS = {

  convert_markdown_to_simulation: `You are an expert educational technology developer specializing in creating complete, executable TypeScript simulation modules.

CRITICAL: Your response must contain ONLY executable TypeScript code with NO explanatory text, comments, or markdown formatting.

TASK: Convert the following markdown lab content into a COMPLETE, EXECUTABLE TypeScript simulation module.

INPUT MARKDOWN LAB:
{markdown_content}

TARGET SUBJECT: {subject}
GRADE LEVEL: {grade_level}
RENDERING LIBRARY: {rendering_library}
COMPLEXITY LEVEL: {complexity_level}

MANDATORY REQUIREMENTS:

1. SCIENTIFICALLY ACCURATE CALCULATIONS:
   - Chemistry: Use real Ka/Kb values, Henderson-Hasselbalch equation, proper equilibrium
   - Physics: Use correct constants (g=9.81), proper vector math, conservation laws
   - Biology: Use realistic kinetics, Michaelis-Menten equations, proper models

2. COMPLETE EXECUTABLE STRUCTURE - Your code must follow this exact pattern:
   - Start with: export const simulationMeta = { ... }
   - CRITICAL: simulationMeta MUST include a variables array with interactive controls
   - Include: export function initializeSimulation(canvas: HTMLCanvasElement): void
   - Include: export function runSimulation(variables: Record<string, any>): any
   - Include: export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void
   - Include: export function renderVisualization(data: any, canvas: HTMLCanvasElement): void
   - End with: export default function mountSimulation(canvas: HTMLCanvasElement, initialVars: Record<string, any>)

REQUIRED SIMULATION METADATA STRUCTURE:
export const simulationMeta = {
  title: "Your Lab Title",
  subject: "chemistry|physics|biology",
  gradeLevel: "9-12",
  variables: [
    {
      name: "concentration",
      type: "slider", 
      min: 0.01,
      max: 1.0,
      step: 0.01,
      unit: "M"
    },
    {
      name: "temperature",
      type: "slider",
      min: 273,
      max: 373,
      step: 1,
      unit: "K"
    }
    // Add more interactive variables as needed
  ],
  outputs: [
    { name: "pH", unit: "", description: "Calculated pH value" },
    { name: "indicatorColor", description: "Visual indicator color" }
  ]
};

3. VISUAL REQUIREMENTS:
   - Professional UI with proper colors, fonts, layouts
   - Real-time visual feedback for all parameter changes
   - Scientific accuracy in all calculations and displays
   - Smooth animations using requestAnimationFrame
   - Educational elements: scales, labels, units, explanations

4. IMPLEMENTATION RULES:
   - ALL variables used must be properly defined before use
   - NO placeholder code with "..." or "implement here" comments
   - NO undefined variables or functions
   - ALL calculations must use real scientific formulas
   - Include complete runSimulation logic with actual calculations
   - All functions must be fully implemented
   - CRITICAL: When returning objects, ALL properties must be defined variables, NOT undefined names
   - Example: return { pH, temperature, color } - ALL variables (pH, temperature, color) must exist
   - FORBIDDEN: return { someUndefinedVariable } - this will cause compilation errors

5. FORBIDDEN ELEMENTS:
   - NO external DOM access (document.getElementById, etc.)
   - NO explanatory text outside the code
   - NO markdown formatting or code blocks
   - NO undefined variables like pHValue or colorObserved without proper definition
   - NO shorthand object properties with undefined variables: { indicatorColor } ❌
   - NO incomplete return statements with missing variable definitions

FUNCTION IMPLEMENTATION PATTERNS:

renderVisualization function should NOT try to draw image data. Instead, it should draw directly on canvas:
CORRECT:
export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Draw scientific visualizations directly on canvas
  // Example: pH scale, molecular diagrams, graphs, etc.
  ctx.fillStyle = data.indicatorColor || "gray";
  ctx.fillRect(50, 50, 100, 100);
  ctx.fillStyle = "black";
  ctx.fillText("pH: " + (data.pH ? data.pH.toFixed(2) : "N/A"), 50, 30);
}

FORBIDDEN:
export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  ctx.drawImage(data.visualization, 0, 0); // ❌ NEVER DO THIS
}

updateSimulation function should update the display with current data:
export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Draw current simulation state
  ctx.fillStyle = "black";
  ctx.fillText("Current pH: " + (variables.pH ? variables.pH.toFixed(2) : "N/A"), 10, 20);
}

mountSimulation function should tie everything together:
export default function mountSimulation(canvas: HTMLCanvasElement, initialVars: Record<string, any>) {
  initializeSimulation(canvas);
  const result = runSimulation(initialVars);
  updateSimulation(result, canvas);
  renderVisualization(result, canvas);
  return result;
}

CORRECT VARIABLE PATTERN EXAMPLE:
In runSimulation function, ALL variables must be defined before use:
- const concentration = variables["concentration"] || 0.1;
- const temperature = variables["temperature"] || 298;
- const Ka = 1.8e-5;
- const pH = -Math.log10(Math.sqrt(Ka * concentration));
- const indicatorColor = pH < 7 ? "red" : pH > 7 ? "blue" : "green";
- return { pH, concentration, temperature, indicatorColor }; // ALL variables defined above

FORBIDDEN PATTERNS:
- return { pH, undefinedVariable }; // undefinedVariable not defined
- return { calculatePH() }; // function calls in object shorthand
- const result = { missingVar }; // missingVar not declared

OUTPUT FORMAT - CRITICAL RULES:
1. Start immediately with: export const simulationMeta = {
2. End with the closing brace of the mountSimulation function
3. Include ONLY executable TypeScript code
4. NO text before or after the code
5. NO markdown code blocks
6. NO comments explaining what the code does
7. ALL functions must be fully implemented with real logic
8. ALL variables must be properly defined before use
9. CRITICAL: Every variable in return statements must be defined first
10. AVOID ERROR: "No value exists in scope for shorthand property" - define ALL variables before returning

Your response must be IMMEDIATELY executable TypeScript code starting with "export const simulationMeta" and ending with the mountSimulation return statement. Do not include any explanatory text.`,

  enhance_simulation_interactivity: `You are an educational UX designer specializing in creating highly engaging, scientifically accurate science simulations.

TASK: Enhance the interactivity, visual appeal, and educational value of this existing simulation by implementing the same quality improvements as a professional educational simulation.

CURRENT SIMULATION:
{simulation_code}

ENHANCEMENT GOALS:
{enhancement_goals}

CRITICAL OUTPUT REQUIREMENTS:
1. Return ONLY executable TypeScript code - NO explanatory text
2. Start immediately with: export const simulationMeta = {
3. End with the closing brace of the mountSimulation function
4. NO markdown formatting, NO code blocks, NO comments
5. ALL variables must be properly defined before use
6. NO placeholder code with "..." or incomplete implementations

MANDATORY IMPROVEMENTS TO IMPLEMENT:
- Scientific accuracy fixes: Replace any oversimplified calculations with proper scientific equations
- Enhanced visual rendering: Add smooth color interpolation, detailed visual elements, real-time measurements
- Advanced interactive features: Add educational information panels, step-by-step visualization, comparative analysis tools
- Professional user interface: Enhanced control layouts, tooltips, real-time feedback
- Educational value enhancements: Show intermediate calculation steps, real-world applications, scenario exploration
- Accessibility and performance: Keyboard navigation, screen reader compatibility, 60fps optimization

SPECIFIC IMPROVEMENTS BY SUBJECT:
Chemistry: Realistic beaker shapes, pH color scales, molecular structure displays, indicator transitions
Physics: Vector field visualizations, trajectory paths, force diagrams, energy conservation displays  
Biology: Animated enzyme-substrate binding, population dynamics graphs, cell animations

FORBIDDEN:
- NO explanatory text outside the code
- NO undefined variables or incomplete functions
- NO placeholder implementations
- NO markdown formatting

Your response must be complete, executable TypeScript code that starts with "export const simulationMeta" and ends with the mountSimulation return statement.`,

  generate_lab_assessment: `You are an educational assessment expert creating evaluation tools for interactive science simulations.

SIMULATION TO ASSESS:
{simulation_code}

SIMULATION METADATA:
{simulation_meta}

ASSESSMENT REQUIREMENTS:
- Formative and summative assessments with real-time tracking and adaptive feedback.
- Align assessment with learning objectives and provide rubric-based scoring.
- Implement tracking of interactions, misconceptions, and progress.
- Support both auto-grading and teacher review.

OUTPUT FORMAT:
Return ONLY the complete assessment TypeScript code without markdown formatting, explanatory text, or code block delimiters. Start directly with the export statements and code.`,

  optimize_simulation_performance: `You are a web performance optimization expert for educational simulations.

SIMULATION CODE:
{simulation_code}

OPTIMIZATION GOALS:
- Maintain scientific accuracy while ensuring 60fps rendering.
- Reduce memory usage and optimize mobile performance.
- Minimize computational complexity using caching, object pooling, and efficient algorithms.

OUTPUT FORMAT:
Return ONLY the complete optimized TypeScript code without markdown formatting, explanatory text, or code block delimiters. Start directly with the export statements and code.`

};

export function getVisualLabPrompt(promptKey: string, variables: Record<string, any>): string {
  let prompt = (VISUAL_LAB_PROMPTS as any)[promptKey];
  if (!prompt) {
    throw new Error(`Visual lab prompt '${promptKey}' not found`);
  }
  
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
export const simulationMeta: SimulationMeta = {
  title: "Interactive Acid-Base Titration with Real-Time pH Monitoring",
  subject: "chemistry",
  gradeLevel: "9-12",
  safetyConsiderations: [
    "Always wear safety goggles when working with acids and bases",
    "Handle all chemicals with proper safety equipment",
    "Report spills immediately to instructor",
    "Never taste or smell unknown chemicals"
  ],
  learningObjectives: [
    "Calculate pH using Henderson-Hasselbalch equation",
    "Identify equivalence point and buffer regions",
    "Interpret titration curves for strong and weak acids",
    "Understand indicator selection based on pH transition ranges"
  ],
  realWorldApplications: [
    "Quality control in food and beverage industry",
    "Environmental monitoring of water pH",
    "Pharmaceutical drug development and testing",
    "Soil chemistry analysis for agriculture"
  ],
  essentialQuestion: "How do molecular-level acid-base interactions manifest in macroscopic pH changes during titration?",
  variables: [
    {
      name: "acid_concentration",
      type: "slider",
      min: 0.01,
      max: 1.0,
      step: 0.01
    },
    {
      name: "acid_type", 
      type: "dropdown",
      options: ["HCl (Strong)", "CH3COOH (Weak, Ka=1.8×10⁻⁵)", "HCOOH (Weak, Ka=1.8×10⁻⁴)"]
    },
    {
      name: "base_volume",
      type: "slider",
      min: 0,
      max: 50,
      step: 0.1
    },
    {
      name: "temperature",
      type: "slider", 
      min: 273,
      max: 373,
      step: 1
    },
    {
      name: "indicator",
      type: "dropdown",
      options: ["Phenolphthalein (pH 8-10)", "Bromothymol Blue (pH 6-7.6)", "Methyl Orange (pH 3.1-4.4)"]
    }
  ],
  outputs: [
    { name: "current_ph", type: "number" },
    { name: "titration_curve", type: "graph" },
    { name: "solution_color", type: "visual" },
    { name: "molecular_view", type: "visual" }
  ]
};`,
    
    molecular_geometry: `
export const simulationMeta: SimulationMeta = {
  title: "3D Molecular Geometry Explorer using VSEPR Theory",
  subject: "chemistry", 
  gradeLevel: "11-12",
  variables: [
    { name: "central_atom", type: "dropdown", options: ["Carbon", "Nitrogen", "Oxygen"] },
    { name: "bonding_pairs", type: "slider", min: 2, max: 6, step: 1 },
    { name: "lone_pairs", type: "slider", min: 0, max: 3, step: 1 },
    { name: "bond_type", type: "dropdown", options: ["Single bonds", "Mix of single/double", "Mix with triple bonds"] },
    { name: "rotation_x", type: "slider", min: 0, max: 360, step: 5 },
    { name: "rotation_y", type: "slider", min: 0, max: 360, step: 5 }
  ],
  outputs: [
    { name: "molecular_shape", type: "visual" },
    { name: "geometry_name", type: "text" },
    { name: "bond_angles", type: "text" },
    { name: "electron_domains", type: "number" },
    { name: "molecular_polarity", type: "text" }
  ]
};`
  },
  
  physics: {
    projectile_motion: `
export const simulationMeta: SimulationMeta = {
  title: "Advanced Projectile Motion with Air Resistance and Vector Analysis",
  subject: "physics",
  gradeLevel: "9-11",
  variables: [
    { name: "initial_velocity", type: "slider", min: 5, max: 100, step: 1 },
    { name: "launch_angle", type: "slider", min: 0, max: 90, step: 1 },
    { name: "gravity", type: "slider", min: 1, max: 15, step: 0.1 },
    { name: "air_resistance", type: "slider", min: 0, max: 0.5, step: 0.01 },
    { name: "projectile_mass", type: "slider", min: 0.1, max: 10, step: 0.1 },
    { name: "launch_height", type: "slider", min: 0, max: 100, step: 1 }
  ],
  outputs: [
    { name: "trajectory_path", type: "visual" },
    { name: "velocity_vectors", type: "visual" },
    { name: "max_height", type: "number" },
    { name: "total_range", type: "number" },
    { name: "flight_time", type: "number" },
    { name: "energy_graph", type: "visual" }
  ]
};`
  }
};
