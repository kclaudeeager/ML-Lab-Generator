

import fetch from 'node-fetch';

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import Groq from 'groq-sdk';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Document, Packer, Paragraph } from 'docx';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class MLLabGenerator {
  // Fallback to Ollama local model if Groq fails
  async callOllamaModel(messages: any, model = 'llama3.2:latest') {
    const prompt = messages.map((m: any) => m.content).join('\n');
    // Use OLLAMA_URL env var or fallback to localhost
    let ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';

    // Test if the Ollama server is reachable, otherwise fallback to localhost:11434
    try {
      const testUrl = ollamaUrl.endsWith('/') ? ollamaUrl.slice(0, -1) : ollamaUrl;
      const res = await fetch(`${testUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: 'ping', stream: false }),
        timeout: 2000
      });
      if (!res.ok) throw new Error('Ollama not responding');
    } catch {
      ollamaUrl = 'http://localhost:11434';
    }  const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      }),
    });
    const bodyText = await response.text();
    console.log('Ollama response status:', response.status);
    console.log('Ollama response headers:', response.headers);
    console.log('Ollama response body:', bodyText);
    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${bodyText}`);
    }
    const data = JSON.parse(bodyText);
    return data.response || data.text || '';
  }

  server: Server;
  constructor() {
    this.server = new Server(
      {
        name: 'ml-lab-generator',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'read_requirements',
            description: 'Read and analyze course requirements to understand the context for lab creation',
            inputSchema: {
              type: 'object',
              properties: {
                requirements: {
                  type: 'string',
                  description: 'Course requirements and learning objectives',
                },
                lesson_topic: {
                  type: 'string',
                  description: 'Specific lesson topic for the lab',
                },
                target_audience: {
                  type: 'string',
                  description: 'Target audience (e.g., complete beginners, some programming experience)',
                },
                duration: {
                  type: 'string',
                  description: 'Expected lab duration (e.g., 1 hour, 2 hours)',
                },
              },
              required: ['requirements', 'lesson_topic'],
            },
          },
          {
            name: 'generate_lab_outline',
            description: 'Generate a comprehensive lab outline based on requirements',
            inputSchema: {
              type: 'object',
              properties: {
                lesson_topic: {
                  type: 'string',
                  description: 'The lesson topic for which to generate the outline',
                },
                requirements_analysis: {
                  type: 'string',
                  description: 'Analysis from read_requirements tool',
                },
                outline_type: {
                  type: 'string',
                  enum: ['basic', 'interactive', 'gamified', 'project-based'],
                  description: 'Type of outline to generate',
                },
              },
              required: ['lesson_topic', 'requirements_analysis'],
            },
          },
          {
            name: 'generate_interactive_lab',
            description: 'Generate a full interactive lab with hands-on activities',
            inputSchema: {
              type: 'object',
              properties: {
                outline: {
                  type: 'string',
                  description: 'Lab outline to base the full lab on',
                },
                interactivity_level: {
                  type: 'string',
                  enum: ['low', 'medium', 'high'],
                  description: 'Level of interactivity to include',
                },
                include_code: {
                  type: 'boolean',
                  description: 'Whether to include code examples and exercises',
                  default: true,
                },
                reflection_questions: {
                  type: 'boolean',
                  description: 'Whether to include reflection questions',
                  default: true,
                },
              },
              required: ['outline'],
            },
          },
          {
            name: 'generate_gamified_lab',
            description: 'Generate a gamified version of the lab with points, badges, and challenges',
            inputSchema: {
              type: 'object',
              properties: {
                base_lab: {
                  type: 'string',
                  description: 'Base lab content to gamify',
                },
                gamification_elements: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['points', 'badges', 'leaderboard', 'challenges', 'achievements', 'story'],
                  },
                  description: 'Gamification elements to include',
                },
                difficulty_progression: {
                  type: 'string',
                  enum: ['linear', 'adaptive', 'choice-based'],
                  description: 'How difficulty should progress',
                },
              },
              required: ['base_lab'],
            },
          },
          {
            name: 'generate_project_based_lab',
            description: 'Generate a project-based lab with real-world applications',
            inputSchema: {
              type: 'object',
              properties: {
                outline: {
                  type: 'string',
                  description: 'Lab outline to base the project on',
                },
                project_theme: {
                  type: 'string',
                  description: 'Theme for the project (e.g., healthcare, finance, entertainment)',
                },
                complexity_level: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Complexity level of the project',
                },
                deliverables: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Expected deliverables from the project',
                },
              },
              required: ['outline', 'project_theme'],
            },
          },
          {
            name: 'review_lab_quality',
            description: 'Review and analyze the quality of a generated lab',
            inputSchema: {
              type: 'object',
              properties: {
                lab_content: {
                  type: 'string',
                  description: 'The lab content to review',
                },
                review_criteria: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['clarity', 'engagement', 'educational_value', 'technical_accuracy', 'progression', 'accessibility'],
                  },
                  description: 'Criteria to evaluate the lab against',
                },
                target_audience: {
                  type: 'string',
                  description: 'Target audience to consider in the review',
                },
              },
              required: ['lab_content'],
            },
          },
          {
            name: 'test_lab_effectiveness',
            description: 'Test the lab for potential issues and effectiveness',
            inputSchema: {
              type: 'object',
              properties: {
                lab_content: {
                  type: 'string',
                  description: 'The lab content to test',
                },
                test_scenarios: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['beginner_student', 'struggling_student', 'advanced_student', 'time_constraints', 'technical_issues'],
                  },
                  description: 'Test scenarios to simulate',
                },
                focus_areas: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['instructions_clarity', 'code_functionality', 'learning_objectives', 'assessment_validity'],
                  },
                  description: 'Areas to focus testing on',
                },
              },
              required: ['lab_content'],
            },
          },
          {
            name: 'generate_assessment_rubric',
            description: 'Generate an assessment rubric for the lab',
            inputSchema: {
              type: 'object',
              properties: {
                lab_content: {
                  type: 'string',
                  description: 'The lab content to create a rubric for',
                },
                assessment_type: {
                  type: 'string',
                  enum: ['formative', 'summative', 'peer', 'self'],
                  description: 'Type of assessment',
                },
                grading_scale: {
                  type: 'string',
                  enum: ['points', 'letter_grades', 'pass_fail', 'mastery_levels'],
                  description: 'Grading scale to use',
                },
              },
              required: ['lab_content'],
            },
          },
          {
            name: 'optimize_lab_content',
            description: 'Optimize lab content based on review feedback',
            inputSchema: {
              type: 'object',
              properties: {
                lab_content: {
                  type: 'string',
                  description: 'Original lab content to optimize',
                },
                review_feedback: {
                  type: 'string',
                  description: 'Feedback from review process',
                },
                optimization_goals: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['improve_clarity', 'increase_engagement', 'fix_technical_issues', 'adjust_difficulty', 'enhance_accessibility'],
                  },
                  description: 'Goals for optimization',
                },
              },
              required: ['lab_content', 'review_feedback'],
            },
          },
          {
            name: 'export_lab_pdf',
            description: 'Export lab content as a PDF file',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'Lab content in Markdown or plain text' }
              },
              required: ['content']
            }
          },
          {
            name: 'export_lab_docx',
            description: 'Export lab content as a DOCX file',
            inputSchema: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'Lab content in Markdown or plain text' }
              },
              required: ['content']
            }
          },
          {
            name: 'summarize_chunk',
            description: 'Summarize a text chunk for use as context in generating a machine learning lab.',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: 'The text chunk to summarize.',
                },
              },
              required: ['text'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'read_requirements':
            return await this.readRequirements(args);
          case 'generate_lab_outline':
            return await this.generateLabOutline(args);
          case 'generate_interactive_lab':
            return await this.generateInteractiveLab(args);
          case 'generate_gamified_lab':
            return await this.generateGamifiedLab(args);
          case 'generate_project_based_lab':
            return await this.generateProjectBasedLab(args);
          case 'review_lab_quality':
            return await this.reviewLabQuality(args);
          case 'test_lab_effectiveness':
            return await this.testLabEffectiveness(args);
          case 'generate_assessment_rubric':
            return await this.generateAssessmentRubric(args);
          case 'optimize_lab_content':
            return await this.optimizeLabContent(args);
          case 'export_lab_pdf':
            return await this.exportLabPDF(args);
          case 'export_lab_docx':
            return await this.exportLabDOCX(args);
          case 'summarize_chunk':
            if (!args || typeof (args as any).text !== 'string') {
              throw new McpError(ErrorCode.InvalidParams, 'summarize_chunk requires a text property');
            }
            return await this.summarizeChunk(args as { text: string });
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  async callGroq(messages: any, model = 'llama3-8b-8192') {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.7,
      });
      return completion.choices[0].message.content;
    } catch (err: any) {
      console.error('Error calling Groq:', err);
      // Fallback on rate limit, network, or timeout error
      const isRateLimit = err?.response?.status === 429 || (typeof err.message === 'string' && err.message.includes('rate limit'));
      const isNetwork = err?.name === 'FetchError' || err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED';
      const isTimeout = (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'));
      if (isRateLimit || isNetwork || isTimeout || !err.response) {
        console.warn('Groq unavailable, rate limited, or timed out. Falling back to Ollama.');
        return await this.callOllamaModel(messages, 'llama3.2:latest');
      }
      throw err;
    }
  }

  async readRequirements(args: any) {
    const { requirements, lesson_topic, target_audience = 'beginners', duration = '1-2 hours' } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert educational content analyst specializing in machine learning education. 
        Analyze the provided requirements and create a comprehensive analysis that will guide lab creation.`,
      },
      {
        role: 'user',
        content: `Analyze these course requirements for creating a machine learning lab:

Requirements: ${requirements}
Lesson Topic: ${lesson_topic}
Target Audience: ${target_audience}
Duration: ${duration}

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
      },
    ];

    const analysis = await this.callGroq(messages);

    return {
      content: [
        {
          type: 'text',
          text: analysis,
        },
      ],
    };
  }

  async generateLabOutline(args: any) {
    const { lesson_topic, requirements_analysis, outline_type = 'interactive' } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert instructional designer specializing in machine learning education. 
        Create detailed lab outlines that are engaging, educational, and appropriate for beginners.`,
      },
      {
        role: 'user',
        content: `Create a comprehensive lab outline for a machine learning lesson:

Lesson Topic: ${lesson_topic}
Outline Type: ${outline_type}

Requirements Analysis:
${requirements_analysis}

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
      },
    ];

    const outline = await this.callGroq(messages);

    return {
      content: [
        {
          type: 'text',
          text: outline,
        },
      ],
    };
  }

  async generateInteractiveLab(args: any) {
    const { outline, interactivity_level = 'high', include_code = true, reflection_questions = true } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert machine learning educator creating interactive lab content. 
        Generate comprehensive, hands-on labs that engage students through practical activities.`,
      },
      {
        role: 'user',
        content: `Create a full interactive lab based on this outline:

${outline}

Requirements:
- Interactivity Level: ${interactivity_level}
- Include Code Examples: ${include_code}
- Include Reflection Questions: ${reflection_questions}

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
      },
    ];

    const lab = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: lab,
        },
      ],
    };
  }

  async generateGamifiedLab(args: any) {
    const { base_lab, gamification_elements = ['points', 'badges', 'challenges'], difficulty_progression = 'linear' } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert in educational gamification and machine learning education. 
        Transform traditional lab content into engaging, game-like experiences that motivate learning.`,
      },
      {
        role: 'user',
        content: `Transform this lab into a gamified experience:

Base Lab Content:
${base_lab}

Gamification Elements to Include: ${gamification_elements.join(', ')}
Difficulty Progression: ${difficulty_progression}

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
      },
    ];

    const gamifiedLab = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: gamifiedLab,
        },
      ],
    };
  }

  async generateProjectBasedLab(args: any) {
    const { outline, project_theme, complexity_level = 'beginner', deliverables = [] } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert in project-based learning and machine learning education. 
        Create comprehensive project-based labs that give students real-world experience.`,
      },
      {
        role: 'user',
        content: `Create a project-based lab based on this outline:

${outline}

Project Theme: ${project_theme}
Complexity Level: ${complexity_level}
Expected Deliverables: ${deliverables.join(', ')}

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
      },
    ];

    const projectLab = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: projectLab,
        },
      ],
    };
  }

  async reviewLabQuality(args: any) {
    const { lab_content, review_criteria = ['clarity', 'engagement', 'educational_value'], target_audience = 'beginners' } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert educational content reviewer specializing in machine learning education. 
        Provide detailed, constructive feedback on lab quality with specific recommendations for improvement.`,
      },
      {
        role: 'user',
        content: `Review this machine learning lab content:

${lab_content}

Review Criteria: ${review_criteria.join(', ')}
Target Audience: ${target_audience}

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
      },
    ];

    const review = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: review,
        },
      ],
    };
  }

  async testLabEffectiveness(args: any) {
    const { lab_content, test_scenarios = ['beginner_student'], focus_areas = ['instructions_clarity'] } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert educational testing specialist. 
        Simulate different student scenarios and test lab effectiveness from multiple perspectives.`,
      },
      {
        role: 'user',
        content: `Test this machine learning lab for effectiveness:

${lab_content}

Test Scenarios: ${test_scenarios.join(', ')}
Focus Areas: ${focus_areas.join(', ')}

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
      },
    ];

    const testReport = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: testReport,
        },
      ],
    };
  }

  async generateAssessmentRubric(args: any) {
    const { lab_content, assessment_type = 'formative', grading_scale = 'points' } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert in educational assessment and machine learning education. 
        Create comprehensive, fair, and effective assessment rubrics.`,
      },
      {
        role: 'user',
        content: `Create an assessment rubric for this machine learning lab:

${lab_content}

Assessment Type: ${assessment_type}
Grading Scale: ${grading_scale}

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
      },
    ];

    const rubric = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: rubric,
        },
      ],
    };
  }

  async optimizeLabContent(args: any) {
    const { lab_content, review_feedback, optimization_goals = ['improve_clarity'] } = args;

    const messages = [
      {
        role: 'system',
        content: `You are an expert educational content optimizer specializing in machine learning education. 
        Improve lab content based on feedback while maintaining educational effectiveness.`,
      },
      {
        role: 'user',
        content: `Optimize this machine learning lab content:

Original Lab Content:
${lab_content}

Review Feedback:
${review_feedback}

Optimization Goals: ${optimization_goals.join(', ')}

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
      },
    ];

    const optimizedLab = await this.callGroq(messages, 'llama3-70b-8192');

    return {
      content: [
        {
          type: 'text',
          text: optimizedLab,
        },
      ],
    };
  }

  async exportLabPDF(args: any) {
    const { content } = args;
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;
    const margin = 40;
    const pageWidth = 612, pageHeight = 792;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    const maxLineLength = 90;
    const lines = content.split('\n');
    for (const line of lines) {
      let text = line;
      while (text.length > 0) {
        const chunk = text.slice(0, maxLineLength);
        page.drawText(chunk, { x: margin, y, size: fontSize, font });
        y -= fontSize + 4;
        text = text.slice(maxLineLength);
        if (y < margin) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
      }
    }
    const pdfBytes = await pdfDoc.save();
    return { buffer: Buffer.from(pdfBytes) };
  }

  async exportLabDOCX(args: any) {
    const { content } = args;
    const lines = content.split('\n').filter((line: any) => line.trim() !== '');
    const paragraphs = lines.map((line: any) => new Paragraph(line));
    const doc = new Document({
      sections: [{ properties: {}, children: paragraphs }]
    });
    const buffer = await Packer.toBuffer(doc);
    return { buffer };
  }

  async summarizeChunk(args: { text: string }) {
    if (!args || typeof args.text !== 'string') {
      throw new Error('summarizeChunk requires an argument object with a text property');
    }
    const { text } = args;
    const messages = [
      {
        role: 'system',
        content: `You are an expert educational summarizer. Read the following text and extract only the most important points, learning objectives, and relevant details, in a clear and concise way. Do not include any introductory or meta language—output only the summary content itself.`,
      },
      {
        role: 'user',
        content: text,
      },
    ];
    const summary = await this.callGroq(messages);
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ML Lab Generator MCP Server running on stdio');
  }
}

export { MLLabGenerator };

const server = new MLLabGenerator();
server.run().catch(console.error);