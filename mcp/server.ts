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
import { 
  getMLPrompt,
  SCIENCE_TOPICS, 
  generateSciencePrompt,
  getScienceReviewPrompt,
  getVisualLabPrompt, 
  SIMULATION_TEMPLATES 
} from './prompts/index.js';
import ts from 'typescript';
import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

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
                lab_type: {
                  type: 'string',
                  enum: ['ml', 'science'],
                  description: 'Type of lab being reviewed (ml for machine learning, science for science labs)',
                  default: 'ml',
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
          {
            name: 'convert_markdown_to_simulation',
            description: 'Convert a markdown lab to an interactive TypeScript simulation',
            inputSchema: {
              type: 'object',
              properties: {
                markdown_content: {
                  type: 'string',
                  description: 'The markdown lab content to convert',
                },
                subject: {
                  type: 'string',
                  enum: ['chemistry', 'physics', 'biology'],
                  description: 'Science subject for the simulation',
                },
                grade_level: {
                  type: 'string',
                  description: 'Target grade level (e.g., 9-12, 11-12)',
                },
                rendering_library: {
                  type: 'string',
                  enum: ['canvas', 'p5js', 'vanilla'],
                  description: 'Preferred rendering library for the simulation',
                  default: 'canvas',
                },
                complexity_level: {
                  type: 'string',
                  enum: ['basic', 'intermediate', 'advanced'],
                  description: 'Complexity level of the interactive simulation',
                  default: 'intermediate',
                },
              },
              required: ['markdown_content', 'subject', 'grade_level'],
            },
          },
          {
            name: 'enhance_simulation_interactivity',
            description: 'Enhance the interactivity and educational value of an existing simulation',
            inputSchema: {
              type: 'object',
              properties: {
                simulation_code: {
                  type: 'string',
                  description: 'The existing TypeScript simulation code to enhance',
                },
                enhancement_goals: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['animations', 'user_experience', 'accessibility', 'mobile_support', 'advanced_controls', 'data_visualization'],
                  },
                  description: 'Specific enhancement goals for the simulation',
                },
              },
              required: ['simulation_code', 'enhancement_goals'],
            },
          },
          {
            name: 'generate_simulation_assessment',
            description: 'Generate assessment tools for an interactive simulation',
            inputSchema: {
              type: 'object',
              properties: {
                simulation_code: {
                  type: 'string',
                  description: 'The TypeScript simulation code to create assessments for',
                },
                assessment_type: {
                  type: 'string',
                  enum: ['formative', 'summative', 'diagnostic', 'adaptive'],
                  description: 'Type of assessment to generate',
                },
                difficulty_level: {
                  type: 'string',
                  enum: ['beginner', 'intermediate', 'advanced'],
                  description: 'Difficulty level for the assessment',
                },
              },
              required: ['simulation_code', 'assessment_type'],
            },
          },
          {
            name: 'optimize_simulation_performance',
            description: 'Optimize simulation code for better performance and mobile compatibility',
            inputSchema: {
              type: 'object',
              properties: {
                simulation_code: {
                  type: 'string',
                  description: 'The TypeScript simulation code to optimize',
                },
                target_platform: {
                  type: 'string',
                  enum: ['desktop', 'mobile', 'tablet', 'all'],
                  description: 'Target platform for optimization',
                  default: 'all',
                },
                performance_goals: {
                  type: 'array',
                  items: {
                    type: 'string',
                    enum: ['60fps', 'low_memory', 'fast_startup', 'smooth_animations', 'responsive_controls'],
                  },
                  description: 'Specific performance optimization goals',
                },
              },
              required: ['simulation_code'],
            },
          },
          {
            name: 'get_simulation_template',
            description: 'Get a pre-built simulation template for common lab types',
            inputSchema: {
              type: 'object',
              properties: {
                subject: {
                  type: 'string',
                  enum: ['chemistry', 'physics', 'biology'],
                  description: 'Science subject for the template',
                },
                lab_type: {
                  type: 'string',
                  description: 'Specific lab type (e.g., acid_base_titration, projectile_motion)',
                },
                customization_level: {
                  type: 'string',
                  enum: ['basic', 'customized', 'advanced'],
                  description: 'Level of customization needed',
                  default: 'basic',
                },
              },
              required: ['subject', 'lab_type'],
            },
          },
          {
          name: 'compile_simulation_code',
          description: 'Compile and bundle TypeScript simulation code into runnable JavaScript for browser execution.',
          inputSchema: {
            type: 'object',
            properties: {
              ts_code: {
                type: 'string',
                description: 'TypeScript simulation source code.'
              }
            },
            required: ['ts_code']
          }
        }

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
          case 'convert_markdown_to_simulation':
            return await this.convertMarkdownToSimulation(args);
          case 'enhance_simulation_interactivity':
            return await this.enhanceSimulationInteractivity(args);
          case 'generate_simulation_assessment':
            return await this.generateSimulationAssessment(args);
          case 'optimize_simulation_performance':
            return await this.optimizeSimulationPerformance(args);
          case 'get_simulation_template':
            return await this.getSimulationTemplate(args);
          case 'compile_simulation_code':
            return await this.compileSimulationCode(args);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        throw new McpError(ErrorCode.InternalError, `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`);
      }
    });
  }

  // Helper function to clean LLM response and extract pure TypeScript code
  private cleanSimulationCode(rawResponse: string): string {
    let cleaned = rawResponse.trim();
    
    // Remove common unwanted prefixes
    const unwantedPrefixes = [
      'Here is the TypeScript code for the interactive simulation:',
      'Here is the TypeScript code:',
      'Here\'s the TypeScript code:',
      'Here is the code:',
      'Here\'s the code:',
      'TypeScript code:',
      'The TypeScript code:',
      'Below is the TypeScript code:',
      '```typescript',
      '```ts',
      '```'
    ];
    
    for (const prefix of unwantedPrefixes) {
      if (cleaned.startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
      }
    }
    
    // Remove trailing code block markers
    const unwantedSuffixes = ['```', '```typescript', '```ts'];
    for (const suffix of unwantedSuffixes) {
      if (cleaned.endsWith(suffix)) {
        cleaned = cleaned.substring(0, cleaned.length - suffix.length).trim();
      }
    }
    
    // Ensure it starts with export const simulationMeta
    if (!cleaned.startsWith('export const simulationMeta')) {
      // Try to find the start of the actual code
      const exportIndex = cleaned.indexOf('export const simulationMeta');
      if (exportIndex > 0) {
        cleaned = cleaned.substring(exportIndex);
      }
    }
    
    return cleaned;
  }

async compileSimulationCode(args: any) {
  const {
    typescript_code,
    target = 'ES2020',
    module = 'ES2020',
    strict = true,
    include_source_map = false
  } = args;

  let code = typescript_code || args.ts_code;
  if (!code) {
    return {
      success: false,
      compiled_code: '',
      diagnostics: [{ message: 'typescript_code is required', severity: 'error', line: 0, column: 0 }]
    };
  }

  // Prepend necessary type definitions and imports for simulation code
  const typeDefinitions = `
// Type definitions for simulation code
interface SimulationMeta {
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
    unit?: string;
  }>;
  outputs?: Array<{
    name: string;
    type?: string;
    unit?: string;
    description?: string;
  }>;
}

// Ensure global types are available
declare global {
  interface SymbolConstructor {
    readonly iterator: unique symbol;
  }
  var Symbol: SymbolConstructor;
  
  interface IterableIterator<T> extends Iterator<T> {
    [Symbol.iterator](): IterableIterator<T>;
  }
  
  interface Iterator<T, TReturn = any, TNext = undefined> {
    next(...args: [] | [TNext]): IteratorResult<T, TReturn>;
    return?(value?: TReturn): IteratorResult<T, TReturn>;
    throw?(e?: any): IteratorResult<T, TReturn>;
  }
  
  interface IteratorResult<T, TReturn = any> {
    done: boolean;
    value: T | TReturn;
  }
  
  interface Array<T> {
    [Symbol.iterator](): IterableIterator<T>;
    [index: number]: T;
    length: number;
    push(...items: T[]): number;
    pop(): T | undefined;
    map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
  }
  interface Function {}
  interface Boolean {}
  interface Number {
    toFixed(digits?: number): string;
    toString(radix?: number): string;
    valueOf(): number;
  }
  interface NumberConstructor {
    (value?: any): number;
    new(value?: any): Number;
    readonly prototype: Number;
    readonly MAX_VALUE: number;
    readonly MIN_VALUE: number;
    readonly NaN: number;
    readonly NEGATIVE_INFINITY: number;
    readonly POSITIVE_INFINITY: number;
    isFinite(number: unknown): boolean;
    isInteger(number: unknown): boolean;
    isNaN(number: unknown): boolean;
    isSafeInteger(number: unknown): boolean;
    parseFloat(string: string): number;
    parseInt(string: string, radix?: number): number;
  }
  interface StringConstructor {
    new(value?: any): String;
    (value?: any): string;
    readonly prototype: String;
    fromCharCode(...codes: number[]): string;
  }
  interface String {
    toString(): string;
    valueOf(): string;
    charAt(pos: number): string;
    charCodeAt(index: number): number;
    concat(...strings: string[]): string;
    indexOf(searchString: string, position?: number): number;
    lastIndexOf(searchString: string, position?: number): number;
    localeCompare(that: string): number;
    match(regexp: string | RegExp): RegExpMatchArray | null;
    replace(searchValue: string | RegExp, replaceValue: string): string;
    search(regexp: string | RegExp): number;
    slice(start?: number, end?: number): string;
    split(separator?: string | RegExp, limit?: number): string[];
    substring(start: number, end?: number): string;
    toLowerCase(): string;
    toLocaleLowerCase(): string;
    toUpperCase(): string;
    toLocaleUpperCase(): string;
    trim(): string;
    readonly length: number;
    substr(from: number, length?: number): string;
    [index: number]: string;
  }
  interface Object {}
  interface RegExp {}
  interface RegExpMatchArray extends Array<string> {
    index?: number;
    input?: string;
    groups?: { [key: string]: string };
  }
  interface IArguments {
    [index: number]: any;
    length: number;
    callee: Function;
  }
  interface Math {
    log10(x: number): number;
    PI: number;
    abs(x: number): number;
    pow(base: number, exponent: number): number;
    sqrt(x: number): number;
    sin(x: number): number;
    cos(x: number): number;
    tan(x: number): number;
    floor(x: number): number;
    ceil(x: number): number;
    round(x: number): number;
    max(...values: number[]): number;
    min(...values: number[]): number;
    random(): number;
  }
  
  // Promise support
  interface Promise<T> {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): Promise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
  }
  
  interface PromiseLike<T> {
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
    ): PromiseLike<TResult1 | TResult2>;
  }
  
  interface PromiseConstructor {
    new <T>(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void): Promise<T>;
    resolve<T>(value: T | PromiseLike<T>): Promise<T>;
    resolve(): Promise<void>;
    reject<T = never>(reason?: any): Promise<T>;
    all<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T[]>;
    race<T>(values: readonly (T | PromiseLike<T>)[]): Promise<T>;
  }
  
  // Typed Arrays
  interface Uint8ClampedArray {
    readonly buffer: ArrayBuffer;
    readonly byteLength: number;
    readonly byteOffset: number;
    readonly length: number;
    [index: number]: number;
    copyWithin(target: number, start: number, end?: number): this;
    every(predicate: (value: number, index: number, array: Uint8ClampedArray) => boolean, thisArg?: any): boolean;
    fill(value: number, start?: number, end?: number): this;
    filter(predicate: (value: number, index: number, array: Uint8ClampedArray) => boolean, thisArg?: any): Uint8ClampedArray;
    find(predicate: (value: number, index: number, obj: Uint8ClampedArray) => boolean, thisArg?: any): number | undefined;
    findIndex(predicate: (value: number, index: number, obj: Uint8ClampedArray) => boolean, thisArg?: any): number;
    forEach(callbackfn: (value: number, index: number, array: Uint8ClampedArray) => void, thisArg?: any): void;
    indexOf(searchElement: number, fromIndex?: number): number;
    join(separator?: string): string;
    lastIndexOf(searchElement: number, fromIndex?: number): number;
    map(callbackfn: (value: number, index: number, array: Uint8ClampedArray) => number, thisArg?: any): Uint8ClampedArray;
    reduce(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number): number;
    reduce<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => U, initialValue: U): U;
    reduceRight(callbackfn: (previousValue: number, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => number): number;
    reduceRight<U>(callbackfn: (previousValue: U, currentValue: number, currentIndex: number, array: Uint8ClampedArray) => U, initialValue: U): U;
    reverse(): Uint8ClampedArray;
    set(array: ArrayLike<number>, offset?: number): void;
    slice(start?: number, end?: number): Uint8ClampedArray;
    some(predicate: (value: number, index: number, array: Uint8ClampedArray) => boolean, thisArg?: any): boolean;
    sort(compareFn?: (a: number, b: number) => number): this;
    subarray(begin?: number, end?: number): Uint8ClampedArray;
    toLocaleString(): string;
    toString(): string;
    valueOf(): Uint8ClampedArray;
  }
  
  interface Uint8ClampedArrayConstructor {
    new (length: number): Uint8ClampedArray;
    new (array: ArrayLike<number>): Uint8ClampedArray;
    new (buffer: ArrayBuffer, byteOffset?: number, length?: number): Uint8ClampedArray;
    readonly prototype: Uint8ClampedArray;
    BYTES_PER_ELEMENT: number;
    of(...items: number[]): Uint8ClampedArray;
    from(arrayLike: ArrayLike<number>): Uint8ClampedArray;
    from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint8ClampedArray;
  }
  
  interface ArrayBuffer {
    readonly byteLength: number;
    slice(begin: number, end?: number): ArrayBuffer;
  }
  
  interface ArrayBufferConstructor {
    new (byteLength: number): ArrayBuffer;
    readonly prototype: ArrayBuffer;
    isView(arg: any): boolean;
  }
  
  interface ArrayLike<T> {
    readonly length: number;
    readonly [n: number]: T;
  }
  
  var Math: Math;
  var Number: NumberConstructor;
  var String: StringConstructor;
  var Promise: PromiseConstructor;
  var Uint8ClampedArray: Uint8ClampedArrayConstructor;
  var ArrayBuffer: ArrayBufferConstructor;
  var parseFloat: (string: string) => number;
  var parseInt: (string: string, radix?: number) => number;
  var isNaN: (value: any) => boolean;
  var isFinite: (value: any) => boolean;
}

// Make Record type available if not already defined
type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// HTML Canvas types
interface HTMLCanvasElement {
  width: number;
  height: number;
  getContext(contextId: "2d"): CanvasRenderingContext2D | null;
}

interface HTMLImageElement {
  src: string;
  width: number;
  height: number;
  complete: boolean;
  naturalWidth: number;
  naturalHeight: number;
}

interface HTMLVideoElement {
  src: string;
  width: number;
  height: number;
  videoWidth: number;
  videoHeight: number;
  currentTime: number;
  duration: number;
  paused: boolean;
  play(): Promise<void>;
  pause(): void;
}

interface ImageBitmap {
  readonly width: number;
  readonly height: number;
  close(): void;
}

interface CanvasRenderingContext2D {
  // Drawing rectangles
  clearRect(x: number, y: number, w: number, h: number): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  strokeRect(x: number, y: number, w: number, h: number): void;
  
  // Drawing text
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): TextMetrics;
  
  // Line styles
  lineWidth: number;
  lineCap: CanvasLineCap;
  lineJoin: CanvasLineJoin;
  miterLimit: number;
  
  // Fill and stroke styles
  fillStyle: string | CanvasGradient | CanvasPattern;
  strokeStyle: string | CanvasGradient | CanvasPattern;
  
  // Shadows
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  // Text styles
  font: string;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  
  // Paths
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
  ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
  rect(x: number, y: number, w: number, h: number): void;
  
  // Drawing paths
  fill(fillRule?: CanvasFillRule): void;
  stroke(): void;
  clip(fillRule?: CanvasFillRule): void;
  isPointInPath(x: number, y: number, fillRule?: CanvasFillRule): boolean;
  isPointInStroke(x: number, y: number): boolean;
  
  // Transformations
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  translate(x: number, y: number): void;
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
  resetTransform(): void;
  
  // Compositing
  globalAlpha: number;
  globalCompositeOperation: string;
  
  // Drawing images
  drawImage(image: CanvasImageSource, dx: number, dy: number): void;
  drawImage(image: CanvasImageSource, dx: number, dy: number, dw: number, dh: number): void;
  drawImage(image: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number): void;
  
  // Pixel manipulation
  createImageData(sw: number, sh: number): ImageData;
  createImageData(imagedata: ImageData): ImageData;
  getImageData(sx: number, sy: number, sw: number, sh: number): ImageData;
  putImageData(imagedata: ImageData, dx: number, dy: number): void;
  putImageData(imagedata: ImageData, dx: number, dy: number, dirtyX: number, dirtyY: number, dirtyWidth: number, dirtyHeight: number): void;
  
  // State management
  save(): void;
  restore(): void;
}

type CanvasTextAlign = "start" | "end" | "left" | "right" | "center";
type CanvasTextBaseline = "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
type CanvasLineCap = "butt" | "round" | "square";
type CanvasLineJoin = "bevel" | "round" | "miter";
type CanvasFillRule = "nonzero" | "evenodd";
type FrameRequestCallback = (time: number) => void;

// Additional Canvas-related interfaces
interface TextMetrics {
  width: number;
  actualBoundingBoxLeft: number;
  actualBoundingBoxRight: number;
  fontBoundingBoxAscent: number;
  fontBoundingBoxDescent: number;
  actualBoundingBoxAscent: number;
  actualBoundingBoxDescent: number;
  emHeightAscent: number;
  emHeightDescent: number;
  hangingBaseline: number;
  alphabeticBaseline: number;
  ideographicBaseline: number;
}

interface ImageData {
  readonly data: Uint8ClampedArray;
  readonly height: number;
  readonly width: number;
}

interface ImageDataConstructor {
  new (width: number, height: number): ImageData;
  new (data: Uint8ClampedArray, width: number, height?: number): ImageData;
  readonly prototype: ImageData;
}

interface CanvasGradient {
  addColorStop(offset: number, color: string): void;
}

interface CanvasPattern {
  setTransform(transform?: DOMMatrix2DInit): void;
}

interface DOMMatrix2DInit {
  a?: number;
  b?: number;
  c?: number;
  d?: number;
  e?: number;
  f?: number;
  m11?: number;
  m12?: number;
  m21?: number;
  m22?: number;
  m41?: number;
  m42?: number;
}

type CanvasImageSource = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | ImageBitmap;

declare var ImageData: ImageDataConstructor;

// Define requestAnimationFrame for animations
declare var requestAnimationFrame: (callback: FrameRequestCallback) => number;

`;

  // Prepend type definitions to the user code
  code = typeDefinitions + code;

  // ---- Step 1: TypeScript diagnostics ----
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget[target as keyof typeof ts.ScriptTarget] || ts.ScriptTarget.ES2020,
    module: ts.ModuleKind[module as keyof typeof ts.ModuleKind] || ts.ModuleKind.ES2020,
    strict: false, // Disable strict mode for generated simulation code
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    lib: ['es2015', 'es2020', 'dom'],
    noImplicitAny: false,
    strictNullChecks: false,
  };

  // Load TypeScript standard library files
  const tsLibDir = path.dirname(ts.getDefaultLibFilePath(compilerOptions));
  const libFiles = ['lib.es2015.d.ts', 'lib.es2020.d.ts', 'lib.dom.d.ts'];
  const libs: Record<string, string> = {};
  for (const lib of libFiles) {
    const libPath = path.join(tsLibDir, lib);
    try {
      libs[lib] = fs.readFileSync(libPath, 'utf-8');
    } catch (err) {
      console.warn(`Could not load ${lib}:`, err);
    }
  }

  const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
  const program = ts.createProgram(['temp.ts', ...libFiles], compilerOptions, {
    getSourceFile: (f) => {
      if (f === 'temp.ts') return sourceFile;
      if (libs[f]) return ts.createSourceFile(f, libs[f], ts.ScriptTarget.Latest, true);
      return undefined;
    },
    writeFile: () => {},
    getCurrentDirectory: () => '',
    getDirectories: () => [],
    fileExists: (f) => f === 'temp.ts' || !!libs[f],
    readFile: (f) => {
      if (f === 'temp.ts') return code;
      if (libs[f]) return libs[f];
      return '';
    },
    getCanonicalFileName: (f) => f,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    getDefaultLibFileName: () => 'lib.es2020.d.ts',
  });

  const diagnostics = ts.getPreEmitDiagnostics(program).map(d => {
    const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    let line = 0, column = 0;
    if (d.file && d.start !== undefined) {
      const pos = d.file.getLineAndCharacterOfPosition(d.start);
      line = pos.line + 1;
      column = pos.character + 1;
    }
    return {
      line,
      column,
      message,
      severity:
        d.category === ts.DiagnosticCategory.Error ? 'error' :
        d.category === ts.DiagnosticCategory.Warning ? 'warning' : 'info'
    };
  });

  const hasErrors = diagnostics.some(d => d.severity === 'error');
  if (hasErrors) {
    return { success: false, compiled_code: '', diagnostics };
  }

  // ---- Step 2: Bundle & transpile with esbuild ----
  const result = await esbuild.build({
    stdin: { contents: code, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    target: 'es2017',
    sourcemap: include_source_map
  });

  return {
    success: true,
    compiled_code: result.outputFiles[0].text,
    source_map: include_source_map ? result.outputFiles.find(f => f.path.endsWith('.map'))?.text : undefined,
    diagnostics
  };
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
    const { lab_content, lab_type = 'ml', review_criteria = ['clarity', 'engagement', 'educational_value'], target_audience = 'beginners' } = args;

    let prompt: string;
    let systemContent: string;

    if (lab_type === 'science') {
      // Use the imported science review function
      prompt = getScienceReviewPrompt({
        lab_content,
        review_criteria: review_criteria.join(', '),
        target_audience
      });
      systemContent = 'You are an expert educational content reviewer specializing in secondary science education.';
    } else {
      // Default to ML review
      prompt = getMLPrompt('review_lab_quality', {
        lab_content,
        review_criteria: review_criteria.join(', '),
        target_audience
      });
      systemContent = 'You are an expert educational content reviewer specializing in machine learning education.';
    }

    const messages = [
      {
        role: 'system',
        content: systemContent,
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

  // === VISUAL SIMULATION METHODS ===

  async convertMarkdownToSimulation(args: any) {
    const { markdown_content, subject, grade_level, rendering_library = 'canvas', complexity_level = 'intermediate' } = args;

    try {
      const prompt = getVisualLabPrompt('convert_markdown_to_simulation', {
        markdown_content,
        subject,
        grade_level,
        rendering_library,
        complexity_level
      });

      const messages = [
        {
          role: 'system',
          content: `You are an expert educational technology developer specializing in converting science labs into interactive TypeScript simulations for ${subject} education.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const simulation = await this.callLLM(messages, 'llama3-70b-8192');
      const cleanedSimulation = this.cleanSimulationCode(simulation);

      return {
        content: [
          {
            type: 'text',
            text: cleanedSimulation,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error converting markdown to simulation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async enhanceSimulationInteractivity(args: any) {
    const { simulation_code, enhancement_goals } = args;

    try {
      const prompt = getVisualLabPrompt('enhance_simulation_interactivity', {
        simulation_code,
        enhancement_goals: enhancement_goals.join(', ')
      });

      const messages = [
        {
          role: 'system',
          content: 'You are an educational UX designer specializing in creating engaging and accessible science simulations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const enhancedSimulation = await this.callLLM(messages, 'llama3-70b-8192');
      const cleanedSimulation = this.cleanSimulationCode(enhancedSimulation);

      return {
        content: [
          {
            type: 'text',
            text: cleanedSimulation,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error enhancing simulation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateSimulationAssessment(args: any) {
    const { simulation_code, assessment_type, difficulty_level = 'intermediate' } = args;

    try {
      const prompt = getVisualLabPrompt('generate_lab_assessment', {
        simulation_code,
        simulation_meta: 'extracted from simulation code',
        assessment_type,
        difficulty_level
      });

      const messages = [
        {
          role: 'system',
          content: 'You are an educational assessment expert creating evaluation tools for interactive science simulations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const assessment = await this.callLLM(messages, 'llama3-70b-8192');

      return {
        content: [
          {
            type: 'text',
            text: assessment,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error generating assessment: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async optimizeSimulationPerformance(args: any) {
    const { simulation_code, target_platform = 'all', performance_goals = ['60fps', 'low_memory'] } = args;

    try {
      const prompt = getVisualLabPrompt('optimize_simulation_performance', {
        simulation_code,
        target_platform,
        performance_goals: performance_goals.join(', ')
      });

      const messages = [
        {
          role: 'system',
          content: 'You are a web performance optimization expert specializing in educational simulations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const optimizedSimulation = await this.callLLM(messages, 'llama3-70b-8192');

      return {
        content: [
          {
            type: 'text',
            text: optimizedSimulation,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error optimizing simulation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async getSimulationTemplate(args: any) {
    const { subject, lab_type, customization_level = 'basic' } = args;

    try {
      // Check if template exists
      const templates = (SIMULATION_TEMPLATES as any)[subject];
      if (!templates || !templates[lab_type]) {
        throw new McpError(ErrorCode.InvalidParams, `Template for ${subject}/${lab_type} not found. Available templates: ${Object.keys(SIMULATION_TEMPLATES).map(s => `${s}: ${Object.keys((SIMULATION_TEMPLATES as any)[s]).join(', ')}`).join('; ')}`);
      }

      let template = templates[lab_type];

      // If customization is needed, enhance the template
      if (customization_level !== 'basic') {
        const prompt = `Customize this simulation template for ${customization_level} level:

${template}

Requirements:
- ${customization_level === 'customized' ? 'Add more interactive elements and educational features' : 'Create advanced features with complex calculations and visualizations'}
- Maintain educational value and safety
- Keep code modular and well-documented`;

        const messages = [
          {
            role: 'system',
            content: 'You are an expert educational simulation developer.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ];

        template = await this.callLLM(messages, 'llama3-70b-8192');
      }

      return {
        content: [
          {
            type: 'text',
            text: template,
          },
        ],
      };
    } catch (error) {
      throw new McpError(ErrorCode.InvalidParams, `Error getting simulation template: ${error instanceof Error ? error.message : String(error)}`);
    }
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
            '- Visual Simulations: convert_markdown_to_simulation, enhance_simulation_interactivity, generate_simulation_assessment, optimize_simulation_performance, get_simulation_template',
          ].join('\n')
        }
      ]
    };
  }
}

export { MLLabGenerator };

const server = new MLLabGenerator();
server.run().catch(console.error);