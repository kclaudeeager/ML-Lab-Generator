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
  
  convert_markdown_to_simulation: `You are an expert educational technology developer specializing in creating highly interactive, visually engaging science simulations with accurate scientific calculations.

TASK: Convert the following markdown lab content into a complete, HIGHLY INTERACTIVE TypeScript-based simulation with rich visualizations and chemically/physically accurate calculations.

INPUT MARKDOWN LAB:
{markdown_content}

TARGET SUBJECT: {subject}
GRADE LEVEL: {grade_level}
RENDERING LIBRARY: {rendering_library} (canvas, p5js, or vanilla)
COMPLEXITY LEVEL: {complexity_level}

MANDATORY SCIENTIFIC ACCURACY REQUIREMENTS:

**FOR CHEMISTRY SIMULATIONS:**
- Use REAL Ka/Kb values from literature (e.g., CH₃COOH Ka = 1.8×10⁻⁵)
- Implement proper equilibrium calculations using quadratic equations for weak acids/bases
- NO arbitrary divisions or approximations (avoid things like "pH = -log(concentration/10)")
- Include Henderson-Hasselbalch equation for buffer calculations
- Use accurate indicator transition ranges (Phenolphthalein: pH 8-10, Bromothymol Blue: pH 6-7.6)
- Implement smooth color interpolation for realistic indicator behavior
- Include temperature effects on equilibrium constants where relevant

**FOR PHYSICS SIMULATIONS:**
- Use correct fundamental constants (g = 9.81 m/s², c = 3×10⁸ m/s, etc.)
- Implement proper vector calculations for forces and motion
- Include realistic friction, air resistance, and energy conservation
- Use accurate wave equations and electromagnetic field calculations
- Apply proper unit conversions and dimensional analysis

**FOR BIOLOGY SIMULATIONS:**
- Use realistic enzyme kinetics (Michaelis-Menten equation)
- Implement accurate population dynamics models (logistic growth, predator-prey)
- Include proper Hardy-Weinberg equilibrium calculations
- Use realistic cellular process rates and concentrations

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

8. **ENHANCED CODE STRUCTURE WITH PROPER SCIENTIFIC CALCULATIONS**:
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
      type: "slider", // or "dropdown", "number", "checkbox"
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
      unit: "units",
      description: "What this output represents"
    }
  ]
};

export function initializeSimulation(canvas: HTMLCanvasElement): void {
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Initialize with proper scaling and coordinate systems
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  
  // Set up initial visualization state
  // DO NOT access external DOM elements
}

export function runSimulation(variables: Record<string, any>): any {
  // CRITICAL: Use scientifically accurate calculations
  // For chemistry: Implement proper equilibrium chemistry
  // For physics: Use correct physical laws and constants
  // For biology: Use realistic biological models
  
  // Example for acid-base chemistry:
  // const Ka = 1.8e-5; // Acetic acid Ka value
  // const concentration = variables["concentration"];
  // const pH = calculateWeakAcidPH(concentration, Ka);
  
  return {
    // Return calculated results with proper units
  };
}

export function updateSimulation(variables: Record<string, any>, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get scientifically accurate results
  const results = runSimulation(variables);
  
  // Render with educational value
  renderVisualization(results, canvas);
  
  // Add informational displays
  renderScientificData(results, ctx);
}

export function renderVisualization(data: any, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  
  // Create engaging, accurate visualizations:
  // - For chemistry: Show molecular representations, pH scales, color changes
  // - For physics: Show vector fields, trajectories, wave patterns
  // - For biology: Show cellular processes, population graphs, enzyme kinetics
  
  // Include educational elements like:
  // - Scale indicators and measurement tools
  // - Labels and annotations
  // - Real-time calculated values
  // - Visual feedback for parameter changes
}
\`\`\`

CRITICAL REQUIREMENTS:
- ALWAYS include the complete variables array in simulationMeta with proper type, min, max, step, and default values
- NEVER access external DOM elements (getElementById, etc.) - work ONLY with the provided canvas
- Include SCIENTIFICALLY ACCURATE calculations using real constants and proper equations
- Create visually engaging animations with smooth 60fps rendering using requestAnimationFrame
- Use proper TypeScript types and comprehensive error handling
- Implement realistic scientific models, not approximations or shortcuts
- Include educational value with proper labeling, scales, and explanations
- Make every user interaction produce immediate, meaningful visual feedback
- Include accessibility features (keyboard navigation, screen reader support)
- Ensure mobile responsiveness with touch interaction support

EXAMPLES OF WHAT NOT TO DO (COMMON MISTAKES):
❌ pH = -Math.log10(concentration / 10) // Arbitrary division
❌ Simple rectangular shapes without educational context
❌ Hard-coded magic numbers without scientific basis
❌ Accessing external DOM elements like document.getElementById()
❌ Basic color changes without smooth transitions
❌ Missing error handling for edge cases
❌ No consideration for mobile devices or accessibility

EXAMPLES OF WHAT TO DO (BEST PRACTICES):
✅ Use proper equilibrium chemistry with real Ka values
✅ Implement smooth color interpolation and animations
✅ Add educational elements like pH scales, measurement tools
✅ Include realistic molecular representations
✅ Show real-time calculations with proper units
✅ Provide immediate visual feedback for all user interactions
✅ Include proper error handling and input validation
✅ Design for mobile touch interactions and keyboard navigation

9. **SPECIFIC IMPLEMENTATION EXAMPLES FOR HIGH-QUALITY SIMULATIONS**:

   **CHEMISTRY - Acid-Base Simulation Example**:
   - Implement Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA])
   - Use quadratic formula for weak acid equilibrium: Ka = [H⁺][A⁻]/[HA]
   - Show realistic beaker with rounded bottom and graduated markings
   - Add pH color scale (0-14) with smooth color interpolation
   - Display molecular representations of acid dissociation
   - Include temperature effects: ΔpKa = -ΔH°/2.303RT
   - Show indicator color changes with accurate transition ranges

   **PHYSICS - Projectile Motion Example**:
   - Use kinematic equations: x = v₀cos(θ)t, y = v₀sin(θ)t - ½gt²
   - Show vector decomposition with real-time arrow displays
   - Include air resistance: F_drag = ½ρv²CdA
   - Display energy conservation: KE + PE = constant
   - Add trajectory prediction with dotted path
   - Show multiple launch scenarios for comparison
   - Include realistic coordinate system with proper scaling

   **BIOLOGY - Enzyme Kinetics Example**:
   - Implement Michaelis-Menten equation: v = (Vmax[S])/(Km + [S])
   - Show 3D enzyme-substrate binding animation
   - Display real-time Lineweaver-Burk plot
   - Include competitive/non-competitive inhibition models
   - Show molecular collision frequency calculations
   - Add temperature and pH effects on enzyme activity

10. **ADVANCED VISUAL FEATURES TO IMPLEMENT**:
    - Multi-layer canvas rendering for complex scenes
    - Particle systems for molecular motion or gas behavior
    - Interactive 3D molecular viewers with rotation controls
    - Real-time graph plotting with multiple data series
    - Zoom and pan functionality for detailed examination
    - Step-by-step animation controls with play/pause
    - Comparative side-by-side scenario analysis
    - Interactive measurement tools (rulers, protractors, pH meters)
    - Data export functionality for further analysis
    - Accessibility features (keyboard navigation, screen reader support)

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

  enhance_simulation_interactivity: `You are an educational UX designer specializing in creating highly engaging, scientifically accurate science simulations.

TASK: Enhance the interactivity, visual appeal, and educational value of this existing simulation by implementing the same quality improvements as a professional educational simulation.

CURRENT SIMULATION:
{simulation_code}

ENHANCEMENT GOALS:
{enhancement_goals}

MANDATORY IMPROVEMENTS TO IMPLEMENT:

1. **SCIENTIFIC ACCURACY FIXES**:
   - Replace any oversimplified calculations with proper scientific equations
   - For chemistry: Use real Ka/Kb values, implement quadratic equations for equilibrium
   - For physics: Use correct physical constants and proper vector mathematics
   - For biology: Implement realistic biological models and rate constants
   - Add temperature, pressure, and other environmental factor effects
   - Include proper unit conversions and dimensional analysis

2. **ENHANCED VISUAL RENDERING**:
   - Implement object-oriented simulation architecture with proper classes
   - Add smooth color interpolation for realistic chemical indicator behavior
   - Create detailed visual elements (rounded beakers, graduated scales, 3D molecules)
   - Include real-time measurement displays (pH scales, vector diagrams, molecular viewers)
   - Add particle systems for dynamic molecular motion
   - Implement smooth animations using requestAnimationFrame
   - Include zoom and pan capabilities for detailed exploration

3. **ADVANCED INTERACTIVE FEATURES**:
   - Add educational information panels with real-time explanations
   - Include step-by-step process visualization with animation controls
   - Implement comparative analysis tools (side-by-side scenarios)
   - Add virtual measurement instruments (pH meters, rulers, thermometers)
   - Include data collection and export capabilities
   - Add guided discovery modes with hints and challenges
   - Implement undo/redo functionality for experimental design

4. **PROFESSIONAL USER INTERFACE**:
   - Enhanced control layouts with descriptive labels and scientific context
   - Tooltips showing scientific constants and equation information  
   - Real-time feedback for all user interactions
   - Professional color schemes and typography
   - Progress indicators and status displays
   - Error handling with educational explanations
   - Mobile-responsive touch controls

5. **EDUCATIONAL VALUE ENHANCEMENTS**:
   - Show intermediate calculation steps and scientific reasoning
   - Include real-world application examples and context
   - Add "what-if" scenario exploration modes
   - Display learning objectives and assessment criteria
   - Include safety considerations and laboratory techniques
   - Show connections between molecular and macroscopic phenomena
   - Add experimental design guidance and hypothesis testing

6. **ACCESSIBILITY AND PERFORMANCE**:
   - Keyboard navigation support for all interactive elements
   - Screen reader compatibility with proper ARIA labels
   - High contrast mode support for visual accessibility
   - Optimized rendering for 60fps performance on mobile devices
   - Efficient memory management and garbage collection
   - Debounced input handling for smooth interactions

7. **SPECIFIC VISUAL IMPROVEMENTS TO IMPLEMENT**:
   
   **For Chemistry Simulations:**
   - Realistic beaker shapes with proper graduated markings
   - pH color scales with smooth interpolation (red→yellow→green→blue)
   - Molecular structure displays with 3D rotation capabilities
   - Indicator color changes with accurate transition ranges
   - Real-time equilibrium arrow displays showing reaction direction
   - Temperature and pressure effect visualizations

   **For Physics Simulations:**
   - Vector field visualizations with proper scaling and direction
   - Trajectory paths with velocity and acceleration components
   - Force diagrams with real-time magnitude and direction updates
   - Wave interference patterns with amplitude and frequency controls
   - Energy conservation displays with kinetic/potential energy bars
   - Coordinate systems with proper units and scaling

   **For Biology Simulations:**
   - Animated enzyme-substrate binding with 3D molecular representations
   - Population dynamics graphs with predator-prey relationships
   - Cell cycle animations with checkpoint controls
   - DNA replication step-by-step with base-pairing visualization
   - Microscope simulation with focus and magnification controls

8. **IMPLEMENTATION STANDARDS**:
   - Use TypeScript classes for modular, maintainable code architecture
   - Implement proper error handling and input validation
   - Include comprehensive documentation and scientific references
   - Use efficient rendering techniques with object pooling
   - Implement proper event handling and memory management
   - Follow accessibility guidelines (WCAG 2.1)
   - Ensure cross-platform compatibility (desktop, tablet, mobile)

Provide the complete enhanced TypeScript code that transforms the existing simulation into a professional-quality educational tool with scientific accuracy, visual appeal, and exceptional user experience.

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
// Enhanced Acid-Base Titration Simulation with Scientific Accuracy
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
      step: 0.01,
      default: 0.1
    },
    {
      name: "acid_type", 
      type: "dropdown",
      options: ["HCl (Strong)", "CH3COOH (Weak, Ka=1.8×10⁻⁵)", "HCOOH (Weak, Ka=1.8×10⁻⁴)"],
      default: "HCl (Strong)"
    },
    {
      name: "base_volume",
      type: "slider",
      min: 0,
      max: 50,
      step: 0.1,
      default: 0
    },
    {
      name: "temperature",
      type: "slider", 
      min: 273,
      max: 373,
      step: 1,
      default: 298
    },
    {
      name: "indicator",
      type: "dropdown",
      options: ["Phenolphthalein (pH 8-10)", "Bromothymol Blue (pH 6-7.6)", "Methyl Orange (pH 3.1-4.4)"],
      default: "Phenolphthalein (pH 8-10)"
    }
  ],
  outputs: [
    {
      name: "current_ph",
      type: "number",
      unit: "",
      description: "Real-time pH based on equilibrium calculations"
    },
    {
      name: "titration_curve",
      type: "graph",
      unit: "pH vs Volume",
      description: "Complete titration curve with equivalence point"
    },
    {
      name: "solution_color",
      type: "visual",
      unit: "",
      description: "Indicator color based on pH and transition range"
    },
    {
      name: "molecular_view",
      type: "visual",
      unit: "",
      description: "Molecular representation of acid-base equilibrium"
    }
  ]
};`,
    
    molecular_geometry: `
// Enhanced Molecular Geometry Explorer with VSEPR Theory
export const simulationMeta: SimulationMeta = {
  title: "3D Molecular Geometry Explorer using VSEPR Theory",
  subject: "chemistry", 
  gradeLevel: "11-12",
  safetyConsiderations: [
    "Understand theoretical nature of molecular modeling",
    "Recognize limitations of simplified molecular representations"
  ],
  learningObjectives: [
    "Apply VSEPR theory to predict molecular geometries",
    "Understand relationship between electron domains and molecular shape",
    "Calculate bond angles based on electron pair repulsion",
    "Visualize 3D molecular structures and their properties"
  ],
  realWorldApplications: [
    "Drug design and molecular docking studies",
    "Materials science and polymer engineering",
    "Environmental chemistry and pollutant behavior",
    "Biochemistry and enzyme-substrate interactions"
  ],
  essentialQuestion: "How do electron pair repulsions determine three-dimensional molecular shapes and their chemical properties?",
  variables: [
    {
      name: "central_atom",
      type: "dropdown",
      options: ["Carbon (C)", "Nitrogen (N)", "Oxygen (O)", "Sulfur (S)", "Phosphorus (P)", "Chlorine (Cl)"],
      default: "Carbon (C)"
    },
    {
      name: "bonding_pairs",
      type: "slider",
      min: 2,
      max: 6,
      step: 1,
      default: 4
    },
    {
      name: "lone_pairs", 
      type: "slider",
      min: 0,
      max: 3,
      step: 1,
      default: 0
    },
    {
      name: "bond_type",
      type: "dropdown",
      options: ["Single bonds", "Mix of single/double", "Mix with triple bonds"],
      default: "Single bonds"
    },
    {
      name: "rotation_x",
      type: "slider",
      min: 0,
      max: 360,
      step: 5,
      default: 45
    },
    {
      name: "rotation_y",
      type: "slider",
      min: 0,
      max: 360,
      step: 5,
      default: 30
    }
  ],
  outputs: [
    {
      name: "molecular_shape",
      type: "visual",
      unit: "",
      description: "Interactive 3D molecular structure with rotation controls"
    },
    {
      name: "geometry_name",
      type: "text",
      unit: "",
      description: "VSEPR geometry classification"
    },
    {
      name: "bond_angles",
      type: "text", 
      unit: "degrees",
      description: "Theoretical and actual bond angles"
    },
    {
      name: "electron_domains",
      type: "number",
      unit: "",
      description: "Total number of electron domains around central atom"
    },
    {
      name: "molecular_polarity",
      type: "text",
      unit: "",
      description: "Predicted molecular polarity based on geometry"
    }
  ]
};`
  },
  
  physics: {
    projectile_motion: `
// Enhanced Projectile Motion Simulator with Vector Analysis
export const simulationMeta: SimulationMeta = {
  title: "Advanced Projectile Motion with Air Resistance and Vector Analysis",
  subject: "physics",
  gradeLevel: "9-11",
  safetyConsiderations: [
    "Never launch actual projectiles in classroom environment",
    "Understand theoretical nature of simulation",
    "Always consider safety when designing real experiments",
    "Recognize limitations of idealized physics models"
  ],
  learningObjectives: [
    "Analyze projectile motion using kinematic equations",
    "Understand vector decomposition of velocity and acceleration",
    "Investigate effects of air resistance on trajectory",
    "Apply energy conservation principles to projectile motion",
    "Predict optimal launch angles for maximum range"
  ],
  realWorldApplications: [
    "Ballistics and artillery calculations",
    "Sports analysis (basketball, golf, baseball)",
    "Rocket and satellite trajectory planning",
    "Video game physics and animation",
    "Engineering design of fountains and water features"
  ],
  essentialQuestion: "How do the fundamental forces of gravity and air resistance affect the motion of projectiles in two dimensions?",
  variables: [
    {
      name: "initial_velocity",
      type: "slider",
      min: 5,
      max: 100,
      step: 1,
      default: 25
    },
    {
      name: "launch_angle",
      type: "slider",
      min: 0,
      max: 90,
      step: 1,
      default: 45
    },
    {
      name: "gravity",
      type: "slider",
      min: 1,
      max: 15,
      step: 0.1,
      default: 9.81
    },
    {
      name: "air_resistance",
      type: "slider",
      min: 0,
      max: 0.5,
      step: 0.01,
      default: 0
    },
    {
      name: "projectile_mass",
      type: "slider",
      min: 0.1,
      max: 10,
      step: 0.1,
      default: 1
    },
    {
      name: "launch_height",
      type: "slider",
      min: 0,
      max: 100,
      step: 1,
      default: 0
    }
  ],
  outputs: [
    {
      name: "trajectory_path",
      type: "visual",
      unit: "",
      description: "Real-time projectile trajectory with vector displays"
    },
    {
      name: "velocity_vectors",
      type: "visual",
      unit: "m/s",
      description: "Velocity component vectors throughout flight"
    },
    {
      name: "max_height",
      type: "number",
      unit: "meters",
      description: "Maximum height reached by projectile"
    },
    {
      name: "total_range",
      type: "number", 
      unit: "meters",
      description: "Horizontal distance traveled"
    },
    {
      name: "flight_time",
      type: "number",
      unit: "seconds",
      description: "Total time in flight"
    },
    {
      name: "energy_graph",
      type: "visual",
      unit: "Joules",
      description: "Kinetic and potential energy throughout flight"
    }
  ]
};`
  }
};
