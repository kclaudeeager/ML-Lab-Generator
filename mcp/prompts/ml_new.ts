// ML Lab Prompt Templates and Helpers

export const ML_PROMPT_TEMPLATES = {
  read_requirements: `You are an expert educational content analyst specializing in machine learning education. 
        Analyze the provided requirements and create a comprehensive analysis that will guide lab creation.

Analyze these course requirements for creating a machine learning lab:

Requirements: {requirements}
Lesson Topic: {lesson_topic}
Target Audience: {target_audience}
Duration: {duration}

Please provide a detailed analysis including:
1. Key learning objectives for this lesson
2. Prerequisites and assumptions about student knowledge
3. Appropriate difficulty level and pacing
4. Recommended hands-on activities and exercises
5. Assessment opportunities
6. Potential challenges students might face
7. Resources and tools needed
8. Success metrics

Make your analysis specific to machine learning education for beginners.`,

  generate_lab_outline: `You are an expert instructional designer specializing in machine learning education. 
        Create detailed lab outlines that are engaging, educational, and appropriate for beginners.

Create a comprehensive lab outline for a machine learning lesson:

Lesson Topic: {lesson_topic}
Outline Type: {outline_type}

Requirements Analysis:
{requirements_analysis}

Please create a detailed outline that includes:
1. Lab title and overview
2. Learning objectives (specific, measurable)
3. Prerequisites and setup requirements
4. Detailed section breakdown with:
   - Introduction/motivation
   - Theory/concept explanation
   - Hands-on activities
   - Practice exercises
   - Reflection questions
   - Assessment components
5. Time allocation for each section
6. Required materials and resources
7. Extension activities for advanced students
8. Troubleshooting guide

Focus on making the lab interactive, engaging, and suitable for beginners in machine learning.`,

  generate_interactive_lab: `You are an expert machine learning educator creating interactive lab content. 
        Generate comprehensive, hands-on labs that engage students through practical activities.

Create a full interactive lab based on this outline:

{outline}

Requirements:
- Interactivity Level: {interactivity_level}
- Include Code Examples: {include_code}
- Include Reflection Questions: {reflection_questions}

Generate a complete lab that includes:
1. Engaging introduction with real-world context
2. Step-by-step interactive activities
3. Code examples and exercises (if requested)
4. Visual elements and diagrams descriptions
5. Interactive checkpoints and self-assessments
6. Reflection questions and discussion prompts
7. Practical exercises with immediate feedback
8. Wrap-up activity that connects to real-world applications

Make the lab highly interactive with frequent opportunities for students to engage with the material. Include specific instructions for interactive elements like:
- Interactive coding exercises
- Data exploration activities
- Visual analysis tasks
- Group discussion prompts
- Self-check quizzes

Focus on making complex ML concepts accessible and engaging for beginners.`
};

// Helper function for ML prompts
export function getMLPrompt(type: keyof typeof ML_PROMPT_TEMPLATES, vars: Record<string, string>) {
  let prompt = ML_PROMPT_TEMPLATES[type];
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return prompt;
}
