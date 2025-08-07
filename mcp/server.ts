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
import { getMLPrompt } from './prompts/ml.js';
import { SCIENCE_TOPICS, generateSciencePrompt } from './prompts/science.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class MLLabGenerator {
  // Fallback to Ollama local model if Groq fails
  async callOllamaModel(messages: any, model = 'llama3.2:latest') {
    const prompt = messages.map((m: any) => m.content).join('\n');
    // Use OLLAMA_URL env var or fallback to localhost
    let ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    console.log('Using Ollama URL:', ollamaUrl);
    const response = await fetch(`${ollamaUrl}/api/generate`, {
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
          {
            name: 'generate_science_lab',
            description: 'Generate science labs for high school courses (chemistry, physics, biology)',
            inputSchema: {
              type: 'object',
              properties: {
                subject: {
                  type: 'string',
                  enum: ['chemistry', 'physics', 'biology'],
                  description: 'Science subject for the lab',
                },
                topic: {
                  type: 'string', 
                  description: 'Specific topic within the subject (e.g., acid-base-chemistry, projectile-motion)',
                },
                lab_type: {
                  type: 'string',
                  enum: ['interactive_lab', 'phet_pre_lab', 'phet_post_lab', 'gamified_lab'],
                  description: 'Type of science lab to generate',
                },
                grade_level: {
                  type: 'string',
                  description: 'Target grade level (e.g., 9th, 10th, 11th, 12th)',
                },
              },
              required: ['subject', 'topic', 'lab_type'],
            },
          },
          {
            name: 'list_science_topics',
            description: 'List available science topics for lab generation',
            inputSchema: {
              type: 'object',
              properties: {
                subject: {
                  type: 'string',
                  enum: ['chemistry', 'physics', 'biology'],
                  description: 'Science subject to list topics for',
                },
              },
              required: ['subject'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'system_status':
            return await this.systemStatus();
          case 'list_lab_recipes':
            return await this.listLabRecipes();
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
          case 'generate_science_lab':
            return await this.generateScienceLab(args);
          case 'list_science_topics':
            return await this.listScienceTopics(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  async callGroq(messages: any, model = 'llama3-8b-8192', maxRetries = 3, delayMs = 1000) {
    function sleep(ms: number) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        if (attempt > 0) await sleep(delayMs * attempt); // Exponential backoff
        const completion = await groq.chat.completions.create({
          messages,
          model,
          temperature: 0.7,
        });
        return completion.choices[0].message.content;
      } catch (err: any) {
        const isRateLimit = err?.response?.status === 429 || (typeof err.message === 'string' && err.message.includes('rate limit'));
        const isNetwork = err?.name === 'FetchError' || err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED';
        const isTimeout = (typeof err.message === 'string' && err.message.toLowerCase().includes('timeout'));
        if (isRateLimit || isNetwork || isTimeout) {
          attempt++;
          if (attempt >= maxRetries) throw err;
        } else {
          throw err;
        }
      }
    }
  }

  async callLLM(messages: any, model = 'llama3-8b-8192') {
    try{
      console.log('Calling Groq with messages:', messages);
      return await this.callGroq(messages, model);
    }
    catch (err: any) {
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

    const prompt = getMLPrompt('read_requirements', {
      requirements,
      lesson_topic,
      target_audience,
      duration
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert educational content analyst.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const analysis = await this.callLLM(messages);

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

    const prompt = getMLPrompt('generate_lab_outline', {
      lesson_topic,
      requirements_analysis,
      outline_type
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert instructional designer.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const outline = await this.callLLM(messages);

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

    const prompt = getMLPrompt('generate_interactive_lab', {
      outline,
      interactivity_level,
      include_code,
      reflection_questions
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert machine learning educator creating interactive lab content.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const lab = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('generate_gamified_lab', {
      base_lab,
      gamification_elements: gamification_elements.join(', '),
      difficulty_progression
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert in educational gamification and machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const gamifiedLab = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('generate_project_based_lab', {
      outline,
      project_theme,
      complexity_level,
      deliverables: deliverables.join(', ')
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert in project-based learning and machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const projectLab = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('review_lab_quality', {
      lab_content,
      review_criteria: review_criteria.join(', '),
      target_audience
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert educational content reviewer specializing in machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const review = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('test_lab_effectiveness', {
      lab_content,
      test_scenarios: test_scenarios.join(', '),
      focus_areas: focus_areas.join(', ')
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert educational testing specialist specializing in machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const testReport = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('generate_assessment_rubric', {
      lab_content,
      assessment_type,
      grading_scale
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert in educational assessment and machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const rubric = await this.callLLM(messages, 'llama3-70b-8192');

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

    const prompt = getMLPrompt('optimize_lab_content', {
      lab_content,
      review_feedback,
      optimization_goals: optimization_goals.join(', ')
    });

    const messages = [
      {
        role: 'system',
        content: 'You are an expert educational content optimizer specializing in machine learning education.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const optimizedLab = await this.callLLM(messages, 'llama3-70b-8192');

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
    const summary = await this.callLLM(messages);
    return {
      content: [
        {
          type: 'text',
          text: summary,
        },
      ],
    };
  }

  async generateScienceLab(args: any) {
    const { subject, topic, lab_type, grade_level } = args;

    try {
      const prompt = generateSciencePrompt(topic, subject, lab_type);
      
      const messages = [
        {
          role: 'system',
          content: `You are an expert secondary science educator specializing in ${subject}.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const lab = await this.callLLM(messages, 'llama3-70b-8192');

      return {
        content: [
          {
            type: 'text',
            text: lab,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error generating science lab: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listScienceTopics(args: any) {
    const { subject } = args;
    
    const validSubjects = ['chemistry', 'physics', 'biology'];
    if (!validSubjects.includes(subject)) {
      throw new McpError(ErrorCode.InvalidParams, `Subject "${subject}" not found. Available subjects: ${validSubjects.join(', ')}`);
    }

    const topics = (SCIENCE_TOPICS as any)[subject];
    if (!topics) {
      throw new McpError(ErrorCode.InvalidParams, `No topics found for subject "${subject}"`);
    }

    const topicList = Object.keys(topics).map(topicKey => {
      const topicData = topics[topicKey];
      return {
        topic: topicKey,
        title: topicKey.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        grade_levels: topicData.grade_levels || [],
        difficulty: topicData.difficulty || 'intermediate',
        concepts: topicData.concepts || [],
        estimated_time: topicData.estimated_time || 60
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Available ${subject} topics:\n\n` + 
                topicList.map(t => 
                  `**${t.title}**\n` +
                  `- Topic ID: ${t.topic}\n` +
                  `- Grade Levels: ${t.grade_levels.join(', ')}\n` +
                  `- Difficulty: ${t.difficulty}\n` +
                  `- Key Concepts: ${t.concepts.join(', ')}\n` +
                  `- Estimated Time: ${t.estimated_time} minutes\n`
                ).join('\n'),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ML Lab Generator MCP Server running on stdio');
  }
  
  // System status endpoint
  async systemStatus() {
    return {
      content: [
        {
          type: 'text',
          text: 'System is online. MCP ML Lab Generator is running.'
        }
      ]
    };
  }

  // List available lab recipes endpoint
  async listLabRecipes() {
    return {
      content: [
        {
          type: 'text',
          text: [
            'Available lab recipes:',
            '- ML: read_requirements, generate_lab_outline, generate_interactive_lab, generate_gamified_lab, generate_project_based_lab, review_lab_quality, test_lab_effectiveness, generate_assessment_rubric, optimize_lab_content, export_lab_pdf, export_lab_docx, summarize_chunk',
            '- Science: generate_science_lab, list_science_topics',
          ].join('\n')
        }
      ]
    };
  }
}

export { MLLabGenerator };

const server = new MLLabGenerator();
server.run().catch(console.error);