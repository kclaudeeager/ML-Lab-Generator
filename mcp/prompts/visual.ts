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
  
  convert_markdown_to_simulation: `You are an expert educational technology developer specializing in creating highly interactive, visually engaging science simulations.

TASK: Convert the following markdown lab content into a complete, HIGHLY INTERACTIVE TypeScript-based simulation with rich visualizations.

INPUT MARKDOWN LAB:
{markdown_content}

TARGET SUBJECT: {subject}
GRADE LEVEL: {grade_level}
RENDERING LIBRARY: {rendering_library} (canvas, p5js, or vanilla)
COMPLEXITY LEVEL: {complexity_level}

CRITICAL REQUIREMENTS FOR ENGAGING SIMULATIONS:

1. **RICH VISUAL INTERACTIONS**:
   - Dynamic color changes showing chemical reactions, pH indicators, or temperature effects
   - Animated particles, molecules, or objects in motion
   - Real-time graphs and charts that update as users adjust parameters
   - Visual representations of abstract concepts (electric fields, wave functions, etc.)
   - Interactive drag-and-drop elements
   - Zoom and pan capabilities for detailed exploration

2. **IMMEDIATE VISUAL FEEDBACK**:
   - Every user input should produce immediate visual changes
   - Use color gradients, animations, and transitions
   - Show cause-and-effect relationships visually
   - Implement hover effects and interactive tooltips
   - Display running calculations and intermediate steps

3. **ADVANCED INTERACTIVE ELEMENTS**:
   - Multiple linked visualizations (e.g., molecular view + macroscopic effects)
   - Interactive timelines or step-through animations
   - Comparative scenarios side-by-side
   - Interactive data collection and analysis tools
   - Virtual instruments and measurement tools

4. **EDUCATIONAL DISCOVERY FEATURES**:
   - "What happens if..." exploration modes
   - Guided discovery paths with hints and challenges
   - Interactive experiments students can design
   - Data visualization and pattern recognition
   - Prediction and hypothesis testing tools

5. **SOPHISTICATED CALCULATIONS AND LOGIC**:
   - Implement realistic scientific models and equations
   - Handle complex multi-variable relationships
   - Provide accurate numerical simulations
   - Include uncertainty and error analysis where appropriate
   - Support experimental data analysis

6. **SPECIFIC EXAMPLES BY SUBJECT**:
   
   **CHEMISTRY**: 
   - Animated molecular structures that show bond formation/breaking
   - Color-changing solutions with realistic pH indicators
   - Interactive periodic table with electron configurations
   - Reaction rate visualizations with collision theory
   - 3D molecular geometry with rotation controls
   
   **PHYSICS**:
   - Animated projectile motion with trajectory visualization
   - Interactive wave interference patterns
   - Electric field line visualizations with moveable charges
   - Oscilloscope-style displays for wave analysis
   - Real-time force vector diagrams
   
   **BIOLOGY**:
   - Animated enzyme-substrate interactions
   - Interactive cell diagrams with zoom levels
   - Population dynamics with predator-prey cycles
   - DNA replication step-by-step animation
   - Microscope simulation with focus controls

7. **TECHNICAL IMPLEMENTATION**:
   - Use HTML5 Canvas with smooth 60fps animations
   - Implement efficient rendering with requestAnimationFrame
   - Create modular, reusable visualization components
   - Include responsive design for mobile devices
   - Add keyboard and touch interaction support

8. **CODE STRUCTURE**:
\`\`\`typescript
export const simulationMeta: SimulationMeta = {
  title: "Descriptive Title",
  subject: "{subject}",
  gradeLevel: "{grade_level}",
  safetyConsiderations: ["Relevant safety notes"],
  learningObjectives: ["Specific, measurable objectives"],
  realWorldApplications: ["How this applies to real world"],
  essentialQuestion: "Key question this simulation answers",
  variables: [
    {
      name: "Parameter Name",
      type: "slider",
      min: 0,
      max: 100,
      step: 1,
      options: ["option1", "option2"] // For dropdown types only
    }
  ],
  outputs: [
    {
      name: "Result Name",
      type: "number",
      unit: "units"
    }
  ]
};

export function initializeSimulation(canvas: HTMLCanvasElement): void {
  // Setup canvas with proper dimensions and context
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Initialize animation state
  // DO NOT access external DOM elements - work only with the canvas
  // Set up any initial drawing or state
}

export function runSimulation(variables: Record<string, any>): any {
  // Perform realistic scientific calculations
  // Use proper formulas and equations
  // Handle edge cases and validation
  // Return structured results object
}

export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  // Clear canvas and redraw everything
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Calculate results
  const results = runSimulation(variables);
  
  // Render visualization with results
  renderVisualization(results, canvas);
}

export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  // Create rich, interactive visualizations
  // Draw animations, charts, graphs
  // Use smooth transitions and effects
  // Make it visually engaging and educational
}
\`\`\`

CRITICAL REQUIREMENTS:
- ALWAYS include the complete variables array in simulationMeta
- NEVER access external DOM elements (getElementById, etc.)
- Work ONLY with the provided canvas element
- Include realistic scientific calculations
- Create visually engaging animations and interactions
- Use proper TypeScript types and error handling

9. **EXAMPLES OF ENGAGING FEATURES TO IMPLEMENT**:
   - Particle systems for chemical reactions or gas behavior
   - Interactive molecular builders with 3D rotation
   - Real-time data plotting with multiple datasets
   - Animated step-by-step process visualization
   - Virtual measurement tools (rulers, thermometers, pH meters)
   - Comparative analysis with multiple scenarios
   - Interactive timelines with playback controls
   - Zoom levels from molecular to macroscopic views

OUTPUT FORMAT:
You must follow these rules EXACTLY:
1. Return ONLY pure TypeScript code with NO explanations, comments, or markdown
2. Start immediately with 'export const simulationMeta'
3. Create a HIGHLY INTERACTIVE and VISUALLY ENGAGING simulation
4. Implement sophisticated animations and real-time feedback
5. Include realistic scientific calculations and visualizations
6. Make every user interaction produce immediate visual changes
7. DO NOT include any:
   - Code block markers (triple backticks typescript or triple backticks) 
   - Explanatory text or descriptions
   - Comments or documentation
   - Markdown formatting
   - Additional whitespace before or after the code
   - Phrases like "Here is the code" or similar
   - ANY text that is not TypeScript code

CRITICAL: Your response must be IMMEDIATE TypeScript code starting with: export const simulationMeta

DO NOT WRITE:
- "Here is the TypeScript code"
- "triple backticks typescript"
- "triple backticks"
- Any explanatory text

WRITE ONLY:
export const simulationMeta = {`,

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
