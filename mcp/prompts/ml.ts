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

Focus on making complex ML concepts accessible and engaging for beginners.`,

  generate_gamified_lab: `You are an expert in educational gamification and machine learning education. 
        Transform traditional lab content into engaging, game-like experiences that motivate learning.

Transform this lab into a gamified experience:

Base Lab Content:
{base_lab}

Gamification Elements to Include: {gamification_elements}
Difficulty Progression: {difficulty_progression}

Create a gamified version that includes:
1. Game narrative/theme that connects to the ML concepts
2. Point system with clear scoring criteria
3. Badge/achievement system with descriptions
4. Challenge levels with increasing difficulty
5. Leaderboard mechanics (if applicable)
6. Progress tracking and feedback systems
7. Unlockable content and rewards
8. Interactive storyline that guides learning
9. Competition and collaboration elements
10. Success celebrations and milestone recognition

Make sure the gamification enhances rather than distracts from the learning objectives. Include specific instructions for implementing game mechanics and tracking student progress.

Keep the focus on machine learning concepts while making the experience fun and engaging.`,

  generate_project_based_lab: `You are an expert in project-based learning and machine learning education. 
        Create comprehensive project-based labs that give students real-world experience.

Create a project-based lab based on this outline:

{outline}

Project Theme: {project_theme}
Complexity Level: {complexity_level}
Expected Deliverables: {deliverables}

Generate a complete project-based lab that includes:
1. Project overview and real-world context
2. Clear project objectives and success criteria
3. Step-by-step project phases with milestones
4. Detailed task descriptions and requirements
5. Resource lists and tools needed
6. Timeline and project management guidance
7. Collaboration and teamwork elements
8. Quality assurance and testing procedures
9. Documentation and presentation requirements
10. Evaluation criteria and rubrics
11. Extension opportunities and next steps

Make the project feel authentic and relevant to real-world machine learning applications. Include specific guidance for:
- Project planning and organization
- Data collection and preparation
- Model development and testing
- Results analysis and interpretation
- Presentation and communication of findings

Ensure the project is appropriate for beginners while being challenging and engaging.`,

  review_lab_quality: `You are an expert educational content reviewer specializing in machine learning education. 
        Provide detailed, constructive feedback on lab quality with specific recommendations for improvement.

Review this machine learning lab content:

{lab_content}

Review Criteria: {review_criteria}
Target Audience: {target_audience}

Provide a comprehensive review that includes:
1. Overall quality assessment (score out of 10)
2. Strengths of the current content
3. Areas for improvement with specific suggestions
4. Evaluation against each review criterion
5. Accessibility and inclusivity considerations
6. Technical accuracy assessment
7. Engagement level and motivation factors
8. Learning objective alignment
9. Pacing and difficulty progression
10. Assessment and feedback mechanisms

For each area, provide:
- Current status assessment
- Specific recommendations for improvement
- Priority level (high, medium, low)
- Implementation suggestions

Focus on how well the lab serves machine learning beginners and whether it effectively teaches the intended concepts.`,

  test_lab_effectiveness: `You are an expert educational testing specialist. 
        Simulate different student scenarios and test lab effectiveness from multiple perspectives.

Test this machine learning lab for effectiveness:

{lab_content}

Test Scenarios: {test_scenarios}
Focus Areas: {focus_areas}

For each test scenario, provide:
1. Scenario description and student profile
2. Walkthrough of the lab from that perspective
3. Potential challenges and obstacles
4. Points of confusion or difficulty
5. Effectiveness of explanations and instructions
6. Engagement and motivation factors
7. Learning outcome achievement likelihood
8. Suggested improvements

For each focus area, evaluate:
- Current effectiveness (1-10 scale)
- Specific issues identified
- Impact on learning outcomes
- Recommended solutions

Provide a comprehensive testing report that includes:
- Executive summary of findings
- Detailed scenario analyses
- Critical issues that need immediate attention
- Suggestions for improvement
- Validation of learning objectives
- Recommendations for pilot testing

Focus on practical issues that real students would encounter when working through this lab.`,

  generate_assessment_rubric: `You are an expert in educational assessment and machine learning education. 
        Create comprehensive, fair, and effective assessment rubrics.

Create an assessment rubric for this machine learning lab:

{lab_content}

Assessment Type: {assessment_type}
Grading Scale: {grading_scale}

Generate a comprehensive rubric that includes:
1. Clear assessment criteria aligned with learning objectives
2. Performance levels and descriptors
3. Scoring guidelines and point allocation
4. Specific indicators for each performance level
5. Feedback prompts and suggestions
6. Self-assessment components
7. Peer assessment elements (if applicable)
8. Rubric usage instructions for instructors
9. Common issues and how to address them
10. Calibration examples and anchor papers

The rubric should evaluate:
- Conceptual understanding
- Practical application skills
- Problem-solving approach
- Code quality and documentation
- Analysis and interpretation
- Communication and presentation
- Collaboration and participation

Make the rubric specific to machine learning concepts while being clear and actionable for both instructors and students.`,

  optimize_lab_content: `You are an expert educational content optimizer specializing in machine learning education. 
        Improve lab content based on feedback while maintaining educational effectiveness.

Optimize this machine learning lab content:

Original Lab Content:
{lab_content}

Review Feedback:
{review_feedback}

Optimization Goals: {optimization_goals}

Provide optimized content that addresses the feedback while achieving the optimization goals. Include:

1. Revised lab content with improvements highlighted
2. Summary of changes made and rationale
3. How each optimization goal was addressed
4. Remaining areas for future improvement
5. Implementation notes for instructors
6. Quality assurance checklist

Focus on:
- Maintaining educational integrity
- Improving student experience
- Addressing identified issues
- Enhancing clarity and engagement
- Ensuring accessibility

Provide the optimized content in a clear, organized format that can be immediately implemented.`,

  summarize_chunk: `You are an expert educational summarizer. Read the following text and extract only the most important points, learning objectives, and relevant details, in a clear and concise way. Do not include any introductory or meta language—output only the summary content itself.

Text to summarize:
{text}`
};

// Helper function for ML prompts
export function getMLPrompt(type: keyof typeof ML_PROMPT_TEMPLATES, vars: Record<string, string>) {
  let prompt = ML_PROMPT_TEMPLATES[type];
  for (const [key, value] of Object.entries(vars)) {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return prompt;
}
