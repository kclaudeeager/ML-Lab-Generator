
// --- SCIENCE TOPICS ---
export const SCIENCE_TOPICS = {
  chemistry: {
    'acid-base-chemistry': {
      grade_levels: ['9th', '10th', '11th', '12th'],
      difficulty: 'intermediate',
      curriculum_standards: ['NGSS HS-PS1-5', 'AP Chemistry 8.1'],
      phET_integration: 'acid-base-solutions',
      concepts: ['pH Scale', 'Acid Strength', 'Concentration', 'Indicators'],
      real_world_applications: ['Food preservation', 'Swimming pool maintenance', 'Stomach acid regulation'],
      common_misconceptions: ['pH 7 is always neutral', 'Strong acids are always concentrated'],
      lab_types: ['pre_lab', 'post_lab', 'companion', 'extended'],
      estimated_time: 25
    },
    'chemical-reactions': {
      grade_levels: ['9th', '10th', '11th'],
      difficulty: 'beginner',
      curriculum_standards: ['NGSS HS-PS1-7', 'NGSS MS-PS1-2'],
      phET_integration: 'balancing-chemical-equations',
      concepts: ['Conservation of Mass', 'Chemical Formulas', 'Coefficients', 'Reactants', 'Products'],
      real_world_applications: ['Cooking', 'Combustion engines', 'Photosynthesis'],
      common_misconceptions: ['Atoms disappear in reactions', 'Bigger molecules are always products'],
      lab_types: ['interactive', 'gamified', 'project_based'],
      estimated_time: 30
    },
    'molecular-geometry': {
      grade_levels: ['11th', '12th'],
      difficulty: 'advanced',
      curriculum_standards: ['AP Chemistry 2.3', 'IB Chemistry SL'],
      phET_integration: null,
      concepts: ['VSEPR Theory', 'Electron Domains', 'Molecular Shapes', 'Bond Angles'],
      real_world_applications: ['Drug design', 'Materials engineering', 'Enzyme function'],
      common_misconceptions: ['All molecules are flat', 'Lone pairs dont affect shape'],
      lab_types: ['interactive', 'extended'],
      estimated_time: 35
    }
  },
  physics: {
    'projectile-motion': {
      grade_levels: ['9th', '10th', '11th'],
      difficulty: 'intermediate',
      curriculum_standards: ['NGSS HS-PS2-1', 'AP Physics 1 3.E'],
      phET_integration: 'projectile-motion',
      concepts: ['Parabolic Motion', 'Range', 'Air Resistance', 'Trajectory', 'Vectors'],
      real_world_applications: ['Sports ballistics', 'Artillery', 'Space missions'],
      common_misconceptions: ['Heavier objects fall faster', 'Horizontal and vertical motions affect each other'],
      lab_types: ['pre_lab', 'post_lab', 'companion'],
      estimated_time: 30
    },
    'electric-circuits': {
      grade_levels: ['8th', '9th', '10th'],
      difficulty: 'beginner',
      curriculum_standards: ['NGSS MS-PS4-3', 'NGSS HS-PS3-3'],
      phET_integration: 'circuit-construction-kit',
      concepts: ['Current', 'Voltage', 'Resistance', 'Ohms Law', 'Series Circuits', 'Parallel Circuits'],
      real_world_applications: ['Home wiring', 'Electronic devices', 'Car electrical systems'],
      common_misconceptions: ['Current is used up in circuits', 'Voltage flows through circuits'],
      lab_types: ['interactive', 'gamified', 'project_based'],
      estimated_time: 40
    },
    'waves-and-sound': {
      grade_levels: ['8th', '9th', '10th'],
      difficulty: 'intermediate',
      curriculum_standards: ['NGSS MS-PS4-1', 'NGSS HS-PS4-1'],
      phET_integration: 'waves-intro',
      concepts: ['Wave Properties', 'Amplitude', 'Frequency', 'Wavelength', 'Wave Speed'],
      real_world_applications: ['Music and sound systems', 'Medical ultrasound', 'Earthquake detection'],
      common_misconceptions: ['Sound travels faster than light', 'Amplitude and frequency are the same'],
      lab_types: ['interactive', 'companion', 'extended'],
      estimated_time: 35
    }
  },
  biology: {
    'enzyme-kinetics': {
      grade_levels: ['10th', '11th', '12th'],
      difficulty: 'advanced',
      curriculum_standards: ['NGSS HS-LS1-6', 'AP Biology 4.1'],
      phET_integration: null,
      concepts: ['Enzyme Activity', 'Activation Energy', 'Temperature Effects', 'pH Effects', 'Substrate Concentration'],
      real_world_applications: ['Digestion', 'Industrial processes', 'Disease diagnosis'],
      common_misconceptions: ['Enzymes are consumed in reactions', 'Higher temperature always increases reaction rate'],
      lab_types: ['interactive', 'project_based', 'extended'],
      estimated_time: 45
    },
    'photosynthesis': {
      grade_levels: ['9th', '10th', '11th'],
      difficulty: 'intermediate',
      curriculum_standards: ['NGSS HS-LS1-5', 'NGSS MS-LS1-5'],
      phET_integration: null,
      concepts: ['Light Reactions', 'Calvin Cycle', 'Chlorophyll', 'Light Intensity Effects'],
      real_world_applications: ['Agriculture', 'Solar energy', 'Climate change'],
      common_misconceptions: ['Plants only photosynthesize during day', 'CO2 is not needed for photosynthesis'],
      lab_types: ['interactive', 'gamified', 'companion'],
      estimated_time: 40
    }
  }
};

// --- SCIENCE PROMPT TEMPLATES ---
export const SCIENCE_PROMPT_TEMPLATES = {
  interactive_lab: `
You are an expert secondary science educator creating interactive virtual labs for {grade_level} students.

TOPIC: {topic_title}
SUBJECT: {subject}
DIFFICULTY: {difficulty}
CONCEPTS: {concepts}
CURRICULUM STANDARDS: {standards}
ESTIMATED TIME: {time} minutes

CONTEXT:
{context_description}

REAL-WORLD APPLICATIONS:
{applications}

COMMON STUDENT MISCONCEPTIONS TO ADDRESS:
{misconceptions}

CREATE AN INTERACTIVE VIRTUAL LAB THAT INCLUDES:

1. **ENGAGING HOOK (5 minutes)**:
   - Real-world scenario that connects to student interests
   - Thought-provoking question or challenge
   - Connection to everyday experiences

2. **BACKGROUND THEORY (8-10 minutes)**:
   - Essential vocabulary with student-friendly definitions
   - Core scientific principles explained simply
   - Visual descriptions of key concepts
   - Address listed misconceptions directly

3. **VIRTUAL EXPERIMENT DESIGN (15-20 minutes)**:
   - Step-by-step experimental procedure
   - Virtual materials list and setup
   - Data collection tables and measurement guides
   - Realistic synthetic data generation rules
   - Interactive elements and student choices

4. **DATA ANALYSIS ACTIVITIES (8-10 minutes)**:
   - Guided data interpretation questions
   - Graph creation and analysis
   - Pattern recognition exercises
   - Mathematical calculations with examples

5. **REAL-WORLD CONNECTIONS (5 minutes)**:
   - How concepts apply to {applications}
   - Career connections in STEM
   - Current events or research applications

6. **ASSESSMENT QUESTIONS**:
   - 3-5 formative assessment questions
   - Self-check quiz with explanations
   - Reflection prompts

REQUIREMENTS:
- Write for {grade_level} reading level
- Include safety considerations where relevant
- Provide realistic data examples
- Create markdown-formatted output
- Include teacher implementation notes
- Address {standards} standards explicitly

Generate a complete, engaging lab that students can complete independently with minimal teacher intervention.
`,

  'hands-on-experiment': `
You are an expert secondary science educator designing hands-on experimental procedures for {grade_level} students.

TOPIC: {topic_title}
SUBJECT: {subject}
DIFFICULTY: {difficulty}
CONCEPTS: {concepts}
CURRICULUM STANDARDS: {standards}
ESTIMATED TIME: {time} minutes

CONTEXT:
{context_description}

REAL-WORLD APPLICATIONS:
{applications}

COMMON STUDENT MISCONCEPTIONS TO ADDRESS:
{misconceptions}

CREATE A HANDS-ON EXPERIMENT LAB THAT INCLUDES:

1. **INTRODUCTION AND OBJECTIVES (5 minutes)**:
   - Clear learning objectives aligned with {standards}
   - Connection to real-world applications: {applications}
   - Essential question to guide investigation

2. **MATERIALS AND SAFETY (5 minutes)**:
   - Complete list of required materials and equipment
   - Detailed safety procedures and precautions
   - Risk assessment and emergency procedures
   - Personal protective equipment requirements

3. **EXPERIMENTAL PROCEDURE (20-25 minutes)**:
   - Step-by-step instructions with clear diagrams
   - Data collection tables and measurement protocols
   - Variables identification (independent, dependent, controlled)
   - Quality control and error reduction strategies

4. **DATA COLLECTION AND ANALYSIS (10-15 minutes)**:
   - Organized data recording sheets
   - Statistical analysis guidance
   - Graph creation and interpretation
   - Error analysis and uncertainty discussion

5. **RESULTS AND CONCLUSIONS (5-8 minutes)**:
   - Evidence-based conclusion framework
   - Connection back to essential question
   - Discussion of limitations and sources of error
   - Suggestions for further investigation

6. **POST-LAB ASSESSMENT**:
   - Comprehensive lab report guidelines
   - Critical thinking questions
   - Real-world application problems

REQUIREMENTS:
- Ensure all procedures are safe for {grade_level} students
- Provide detailed troubleshooting guidance
- Include assessment rubrics
- Address common misconceptions: {misconceptions}
- Create markdown-formatted output with clear sections

Generate a complete hands-on experimental lab with detailed procedures and safety considerations.
`,

  simulation: `
You are an expert secondary science educator creating computer simulation-based labs for {grade_level} students.

TOPIC: {topic_title}
SUBJECT: {subject}
DIFFICULTY: {difficulty}
CONCEPTS: {concepts}
CURRICULUM STANDARDS: {standards}
ESTIMATED TIME: {time} minutes

CONTEXT:
{context_description}

REAL-WORLD APPLICATIONS:
{applications}

COMMON STUDENT MISCONCEPTIONS TO ADDRESS:
{misconceptions}

CREATE A SIMULATION-BASED LAB THAT INCLUDES:

1. **PRE-SIMULATION SETUP (5 minutes)**:
   - Learning objectives aligned with {standards}
   - Overview of simulation tools and interface
   - Connection to real-world phenomena: {applications}

2. **THEORETICAL BACKGROUND (8-10 minutes)**:
   - Key concepts and principles: {concepts}
   - Mathematical relationships and equations
   - Predictions and hypothesis formation
   - Address misconceptions: {misconceptions}

3. **SIMULATION ACTIVITIES (20-25 minutes)**:
   - Guided exploration of simulation parameters
   - Systematic data collection protocols
   - Variable manipulation experiments
   - Pattern recognition exercises
   - Multiple trial requirements for reliability

4. **DATA ANALYSIS AND MODELING (10-12 minutes)**:
   - Quantitative analysis techniques
   - Graph creation and curve fitting
   - Mathematical modeling exercises
   - Comparison with theoretical predictions

5. **REAL-WORLD VALIDATION (5 minutes)**:
   - Comparison with actual experimental data
   - Discussion of simulation limitations
   - Real-world applications: {applications}

6. **ASSESSMENT AND REFLECTION**:
   - Concept check questions
   - Simulation interpretation challenges
   - Critical thinking about model accuracy

REQUIREMENTS:
- Specify simulation software or online tools
- Include detailed parameter settings
- Provide data analysis templates
- Create engaging challenges and extensions
- Format in clear markdown structure

Generate a comprehensive simulation lab that helps students understand {concepts} through virtual experimentation.
`,

  'inquiry-based': `
You are an expert secondary science educator designing inquiry-based learning experiences for {grade_level} students.

TOPIC: {topic_title}
SUBJECT: {subject}
DIFFICULTY: {difficulty}
CONCEPTS: {concepts}
CURRICULUM STANDARDS: {standards}
ESTIMATED TIME: {time} minutes

CONTEXT:
{context_description}

REAL-WORLD APPLICATIONS:
{applications}

COMMON STUDENT MISCONCEPTIONS TO ADDRESS:
{misconceptions}

CREATE AN INQUIRY-BASED LAB THAT INCLUDES:

1. **ENGAGING PHENOMENON (5-8 minutes)**:
   - Intriguing real-world phenomenon or problem
   - Demonstration or observation that sparks curiosity
   - Connection to student experiences and interests
   - Initial wonderings and question generation

2. **STUDENT QUESTION DEVELOPMENT (8-10 minutes)**:
   - Guided question formulation process
   - Question refinement and focus
   - Hypothesis development
   - Prediction and reasoning

3. **INVESTIGATION DESIGN (15-20 minutes)**:
   - Student-led experimental design
   - Materials selection and justification
   - Variable identification and control
   - Procedure development with teacher guidance
   - Safety consideration discussion

4. **DATA COLLECTION AND EVIDENCE GATHERING (15-20 minutes)**:
   - Student-directed data collection
   - Qualitative and quantitative observations
   - Multiple trials and data validation
   - Documentation and organization strategies

5. **ANALYSIS AND PATTERN RECOGNITION (8-10 minutes)**:
   - Student-led data analysis
   - Pattern identification and interpretation
   - Evidence evaluation and reasoning
   - Conclusion development

6. **COMMUNICATION AND REFLECTION (5-8 minutes)**:
   - Scientific argumentation practice
   - Peer review and discussion
   - Reflection on learning process
   - New questions and further investigations

ASSESSMENT FRAMEWORK:
- Process-focused evaluation rubrics
- Scientific reasoning assessments
- Collaboration and communication skills
- Conceptual understanding checks

REQUIREMENTS:
- Promote student autonomy and choice
- Include scaffolding for different skill levels
- Address misconceptions through discovery: {misconceptions}
- Connect to standards: {standards}
- Encourage scientific thinking and discourse

Generate an inquiry-based lab that empowers students to discover {concepts} through their own investigations.
`,

  demonstration: `
You are an expert secondary science educator creating engaging demonstration-based lessons for {grade_level} students.

TOPIC: {topic_title}
SUBJECT: {subject}
DIFFICULTY: {difficulty}
CONCEPTS: {concepts}
CURRICULUM STANDARDS: {standards}
ESTIMATED TIME: {time} minutes

CONTEXT:
{context_description}

REAL-WORLD APPLICATIONS:
{applications}

COMMON STUDENT MISCONCEPTIONS TO ADDRESS:
{misconceptions}

CREATE A DEMONSTRATION LAB THAT INCLUDES:

1. **PRE-DEMONSTRATION SETUP (5 minutes)**:
   - Learning objectives aligned with {standards}
   - Prediction and hypothesis activity
   - Connection to prior knowledge
   - Safety briefing for observers

2. **ENGAGING DEMONSTRATION (10-15 minutes)**:
   - Step-by-step demonstration procedure
   - Clear visual elements and dramatic effects
   - Student observation prompts and data recording
   - Interactive questioning during demonstration
   - Multiple perspectives and viewing angles

3. **IMMEDIATE ANALYSIS (8-10 minutes)**:
   - Guided observation discussion
   - Data interpretation and pattern recognition
   - Comparison with initial predictions
   - Concept clarification and vocabulary

4. **CONCEPTUAL EXPLANATION (10-12 minutes)**:
   - Scientific principles underlying the demonstration
   - Mathematical relationships and calculations
   - Connection to {concepts}
   - Address misconceptions: {misconceptions}

5. **REAL-WORLD CONNECTIONS (5-8 minutes)**:
   - Applications in everyday life: {applications}
   - Technology and industry connections
   - Current research and developments
   - Career connections in STEM

6. **FOLLOW-UP ACTIVITIES**:
   - Student replication guidelines (if safe)
   - Extension experiments and variations
   - Home connections and observations
   - Assessment questions and reflection

SAFETY CONSIDERATIONS:
- Detailed risk assessment
- Emergency procedures
- Student positioning and protection
- Equipment safety checks

REQUIREMENTS:
- Include detailed setup instructions
- Provide troubleshooting guidance
- Create engaging presentation techniques
- Include assessment rubrics
- Format in clear markdown structure

Generate a captivating demonstration lab that effectively illustrates {concepts} through visual and memorable experiences.
`
};

// --- EASY STARTING TOPICS ---
export const EASY_WINS = [
  {
    topic: 'acid-base-chemistry',
    subject: 'chemistry',
    rationale: 'Visual color changes, clear PhET integration, common in curriculum',
    teacher_appeal: 'Always needed, hard to do safely in class',
    success_factors: ['Visual results', 'Safety concerns make virtual attractive', 'PhET popular']
  },
  {
    topic: 'electric-circuits', 
    subject: 'physics',
    rationale: 'Hands-on appeal, expensive equipment, clear learning progression',
    teacher_appeal: 'Equipment expensive, students love building circuits',
    success_factors: ['Interactive elements', 'Cost savings', 'Visual feedback']
  },
  {
    topic: 'enzyme-kinetics',
    subject: 'biology', 
    rationale: 'No PhET equivalent, complex topic, generates realistic data',
    teacher_appeal: 'Hard to demonstrate, abstract concepts made concrete',
    success_factors: ['Fills PhET gap', 'Realistic data', 'Abstract made visual']
  }
];

// --- TEACHER OUTREACH TEMPLATES ---
export const TEACHER_OUTREACH = {
  email_template: `
Subject: Free Virtual Lab Generator - Help Students Master {TOPIC}

Hi {TEACHER_NAME},

I'm developing an AI tool that generates custom virtual science labs for secondary students. I'd love 15 minutes of your time to show you a demo and get your feedback.

**What it does:**
• Generates unlimited virtual labs for any science topic
• Creates realistic data and interactive experiments  
• Aligns with curriculum standards (NGSS, AP, etc.)
• Works with or without existing tools like PhET

**Quick demo of:** {TOPIC} lab for {GRADE_LEVELS}
• Interactive virtual experiments
• Auto-generated realistic data
• Built-in assessment questions
• Teacher dashboard with analytics

**What I need:** 15-20 minutes of your expert feedback on whether this would be useful in your classroom.

**What you get:** Early access to the tool when it's ready + all generated labs for your topics

Would you be available for a quick video call this week or next?

Best regards,
{YOUR_NAME}
`,
  
  follow_up_survey: `
Virtual Lab Generator - Teacher Feedback Survey

Thank you for reviewing our {TOPIC} virtual lab demo!

1. How relevant is this topic to your current curriculum? (1-5 scale)
2. How would this lab compare to your current teaching methods for this topic?
3. What concerns do you have about implementing virtual labs?
4. What features would make this most useful for your students?
5. Would you be interested in pilot testing this with one of your classes?
6. What other science topics would benefit from virtual labs?
7. How much would your school budget for a tool like this per year?

Additional comments:
`
};

// --- PROMPT GENERATION FUNCTIONS ---
export function generateSciencePrompt(topic: string, subject: string, labType: string = 'interactive_lab'): string {
  const topicData = (SCIENCE_TOPICS as any)[subject]?.[topic];
  if (!topicData) throw new Error(`Topic ${topic} not found in subject ${subject}`);
  
  // Convert API lab type to template key
  let templateKey = labType;
  if (labType === 'hands-on-experiment') {
    templateKey = 'hands-on-experiment';
  } else if (labType === 'simulation') {
    templateKey = 'simulation';
  } else if (labType === 'inquiry-based') {
    templateKey = 'inquiry-based';
  } else if (labType === 'demonstration') {
    templateKey = 'demonstration';
  } else if (labType === 'interactive') {
    templateKey = 'interactive_lab';
  }
  
  const template = (SCIENCE_PROMPT_TEMPLATES as any)[templateKey];
  if (!template) throw new Error(`Lab type ${labType} not supported. Supported types: hands-on-experiment, simulation, inquiry-based, demonstration, interactive_lab`);
  
  return template
    .replace(/{topic_title}/g, topic.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()))
    .replace(/{subject}/g, subject.charAt(0).toUpperCase() + subject.slice(1))
    .replace(/{grade_level}/g, topicData.grade_levels.join(', '))
    .replace(/{difficulty}/g, topicData.difficulty)
    .replace(/{concepts}/g, topicData.concepts.join(', '))
    .replace(/{standards}/g, topicData.curriculum_standards.join(', '))
    .replace(/{time}/g, topicData.estimated_time)
    .replace(/{applications}/g, topicData.real_world_applications.join(', '))
    .replace(/{misconceptions}/g, topicData.common_misconceptions.join(', '))
    .replace(/{phet_simulation}/g, topicData.phET_integration || 'N/A')
    .replace(/{context_description}/g, `Students will explore ${topicData.concepts.join(', ')} through ${labType.replace(/-/g, ' ')} methodology.`);
}

export function createValidationPlan(topic: string, subject: string): any {
  const topicData = (SCIENCE_TOPICS as any)[subject][topic];
  return {
    topic: topic,
    subject: subject,
    validation_approach: {
      target_teachers: [
        `${subject} teachers in grades ${topicData.grade_levels.join(', ')}`,
        'Science department heads',
        'Curriculum coordinators'
      ],
      pilot_questions: [
        `How do you currently teach ${topic.replace(/-/g, ' ')}?`,
        'What are the biggest challenges with this topic?',
        'How long do you spend on this concept?',
        'What would make this topic easier to teach?',
        'Would virtual labs help with safety/equipment concerns?'
      ],
      success_metrics: [
        'Teacher interest level (1-10 scale)',
        'Willingness to pilot test',
        'Perceived time savings',
        'Alignment with curriculum needs'
      ],
      demo_format: {
        duration: '15-20 minutes',
        format: 'Screen share walkthrough',
        focus: 'Student experience and teacher dashboard',
        followup: 'Feedback survey and pilot invitation'
      }
    },
    implementation_timeline: {
      week_1: 'Generate lab content with AI',
      week_2: 'Create basic interactive version',
      week_3: 'Teacher feedback sessions (5-7 teachers)',
      week_4: 'Iterate based on feedback',
      week_5: 'Pilot test with 2-3 classes'
    }
  };
}

// Science lab review function
export function getScienceReviewPrompt(args: { lab_content: string; review_criteria: string; target_audience: string }) {
  const { lab_content, review_criteria, target_audience } = args;
  
  return `You are an expert educational content reviewer specializing in secondary science education. 
Provide detailed, constructive feedback on science lab quality with specific recommendations for improvement.

Review this science lab content:

${lab_content}

Review Criteria: ${review_criteria}
Target Audience: ${target_audience}

Provide a comprehensive review that includes:
1. Overall quality assessment (score out of 10)
2. Strengths of the current content
3. Areas for improvement with specific suggestions
4. Evaluation against each review criterion
5. Safety and accessibility considerations
6. Scientific accuracy assessment
7. Engagement level and hands-on learning factors
8. Learning objective alignment with science standards
9. Procedural clarity and difficulty progression
10. Assessment and scientific inquiry components

For each area, provide:
- Current status assessment
- Specific recommendations for improvement
- Alignment with Next Generation Science Standards (NGSS) or relevant curriculum standards
- Laboratory safety considerations
- Real-world application connections

Focus on science-specific aspects such as:
- Scientific method integration
- Data collection and analysis procedures
- Laboratory technique development
- Scientific reasoning and critical thinking
- Evidence-based conclusions
- Collaborative scientific practice`;
}
