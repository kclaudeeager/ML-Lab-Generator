// @ts-ignore
import express, { Request, Response, NextFunction } from 'express';
// @ts-ignore
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import { MLLabGenerator } from './server.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// @ts-ignore
import multer from 'multer';
import * as mammoth from 'mammoth';
import { promises as fsPromises } from 'fs';
import os from 'os';
import { HierarchicalDocumentProcessor } from './utils/HierarchicalDocumentProcessor.js';
import { SemanticDocumentProcessor } from './utils/SemanticDocumentProcessor.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3001;

// Swagger setup - Manual specification instead of using file parsing
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'ML Lab Generator API',
    version: '1.0.0',
    description: 'API documentation for ML Lab Generator tools',
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: 'Development server',
    },
    {
        url: 'https://ml-lab-generator-server.onrender.com',
        description: 'Production server',
    }
  ],
  paths: {
    '/api/upload_document_enhanced': {
      post: {
        summary: 'Upload and process a DOCX or PDF file',
        description: 'Uploads a .docx or .pdf file, extracts its text, and processes it using hierarchical or semantic analysis. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  document: {
                    type: 'string',
                    format: 'binary',
                    description: 'The .docx or .pdf file to upload',
                  },
                  processingType: {
                    type: 'string',
                    enum: ['hierarchical', 'semantic'],
                    description: 'Processing type (hierarchical or semantic)',
                  },
                },
                required: ['document'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Processed document result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    filename: { type: 'string' },
                    size: { type: 'integer' },
                    processingType: { type: 'string' },
                    originalLength: { type: 'integer' },
                    finalSummary: { type: 'string' },
                    sections: { type: 'array', items: { type: 'object' } },
                  },
                },
              },
            },
          },
          '400': { description: 'No file uploaded or no text content found' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/generate_lab_from_processed_document': {
      post: {
        summary: 'Generate a lab from a processed document',
        description: 'Generates a lab (interactive or project-based) from a processed document object, lesson topic, and other metadata. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  processedDocument: { type: 'object', description: 'The processed document object' },
                  lesson_topic: { type: 'string', description: 'The specific lesson topic for the lab.' },
                  target_audience: { type: 'string', description: 'Target audience for the lab (default: "beginners").', default: 'beginners' },
                  duration: { type: 'string', description: 'Expected duration of the lab (default: "1-2 hours").', default: '1-2 hours' },
                  lab_type: { type: 'string', description: 'Type of lab to generate (interactive, project-based).', enum: ['interactive', 'project-based'], default: 'interactive' },
                  project_theme: { type: 'string', description: 'Optional theme for project-based lab.' },
                  focus_areas: { type: 'array', items: { type: 'string' }, description: 'Specific areas to focus on.' },
                },
                required: ['processedDocument', 'lesson_topic'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Generated lab content and metadata',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    context: { type: 'string' },
                    requirements: { type: 'string' },
                    outline: { type: 'string' },
                    lab: { type: 'string' },
                    metadata: {
                      type: 'object',
                      properties: {
                        document_type: { type: 'string' },
                        key_topics: { type: 'array', items: { type: 'string' } },
                        estimated_complexity: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Missing required fields' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/query_document': {
      post: {
        summary: 'Query a processed document for relevant sections and contextual answer',
        description: 'Finds relevant sections in a processed document and generates a contextual answer to a query. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  processedDocument: { type: 'object', description: 'The processed document object' },
                  query: { type: 'string', description: 'The query to answer' },
                  context_window: { type: 'integer', description: 'Number of relevant sections to consider (default: 3)', default: 3 },
                },
                required: ['processedDocument', 'query'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Contextual answer and relevant sections',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    query: { type: 'string' },
                    answer: { type: 'string' },
                    relevantSections: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          title: { type: 'string' },
                          summary: { type: 'string' },
                          relevanceScore: { type: 'number' },
                        },
                      },
                    },
                    sources: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          '400': { description: 'Missing required fields' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/read_requirements': {
      post: {
        summary: 'Analyze course requirements for lab creation',
        description: 'Analyzes course requirements and generates recommendations for lab creation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requirements: {
                    type: 'string',
                    description: 'Course requirements text'
                  },
                  lesson_topic: {
                    type: 'string',
                    description: 'The specific lesson topic'
                  },
                  target_audience: {
                    type: 'string',
                    description: 'Target audience for the lab'
                  },
                  duration: {
                    type: 'string',
                    description: 'Expected duration of the lab'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Analysis result',
            content: {
              'application/json': {
                schema: {
                  type: 'object'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          }
        }
      }
    },
    '/api/generate_lab_outline': {
      post: {
        summary: 'Generate a lab outline',
        description: 'Creates a structured outline for a machine learning lab',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  requirements: { type: 'string' },
                  topic: { type: 'string' },
                  difficulty: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Lab outline generated successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/generate_interactive_lab': {
      post: {
        summary: 'Generate an interactive lab',
        description: 'Creates an interactive machine learning lab with hands-on exercises',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  outline: { type: 'string' },
                  interactivity_level: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Interactive lab generated successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/generate_gamified_lab': {
      post: {
        summary: 'Generate a gamified lab',
        description: 'Creates a gamified machine learning lab with game elements',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  outline: { type: 'string' },
                  gamification_level: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Gamified lab generated successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/generate_project_based_lab': {
      post: {
        summary: 'Generate a project-based lab',
        description: 'Creates a project-based machine learning lab',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  outline: { type: 'string' },
                  project_scope: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Project-based lab generated successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/review_lab_quality': {
      post: {
        summary: 'Review lab quality',
        description: 'Analyzes and provides feedback on lab quality',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab_content: {
                    type: 'string',
                    description: 'The lab content to review'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Lab quality review completed' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/test_lab_effectiveness': {
      post: {
        summary: 'Test lab effectiveness',
        description: 'Evaluates the effectiveness of a lab',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab_content: { type: 'string' },
                  metrics: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Lab effectiveness test completed' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/generate_assessment_rubric': {
      post: {
        summary: 'Generate assessment rubric',
        description: 'Creates an assessment rubric for a lab',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab_content: { type: 'string' },
                  assessment_criteria: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Assessment rubric generated successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/optimize_lab_content': {
      post: {
        summary: 'Optimize lab content',
        description: 'Optimizes existing lab content for better learning outcomes',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab_content: { type: 'string' },
                  optimization_goals: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'Lab content optimized successfully' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/export_lab_pdf': {
      post: {
        summary: 'Export lab as PDF',
        description: 'Exports lab content as a PDF document',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    description: 'Lab content in Markdown or plain text'
                  },
                  filename: {
                    type: 'string',
                    description: 'Output filename (optional)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'PDF file',
            content: {
              'application/pdf': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/export_lab_docx': {
      post: {
        summary: 'Export lab as DOCX',
        description: 'Exports lab content as a DOCX document',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    description: 'Lab content in Markdown or plain text'
                  },
                  filename: {
                    type: 'string',
                    description: 'Output filename (optional)'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'DOCX file',
            content: {
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
                schema: {
                  type: 'string',
                  format: 'binary'
                }
              }
            }
          },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/save_lab': {
      post: {
        summary: 'Save a new lab',
        description: 'Save a generated lab with metadata. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  labType: { type: 'string', description: 'Lab type (interactive, gamified, project-based)' },
                  requirements: { type: 'string', description: 'Lab requirements' },
                  lessonTopic: { type: 'string', description: 'Lesson topic' },
                  audience: { type: 'string', description: 'Target audience' },
                  duration: { type: 'string', description: 'Lab duration' },
                  content: { type: 'string', description: 'Lab content' },
                },
                required: ['labType', 'requirements', 'lessonTopic', 'audience', 'duration', 'content'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Lab saved',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { success: { type: 'boolean' }, lab: { type: 'object' } } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '400': { description: 'Missing required fields' },
        },
      },
    },
    '/api/labs': {
      get: {
        summary: 'List all saved labs',
        description: 'Get all saved labs. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        responses: {
          '200': {
            description: 'Array of labs',
            content: {
              'application/json': {
                schema: { type: 'array', items: { type: 'object' } },
              },
            },
          },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/labs/{id}': {
      get: {
        summary: 'Get a single lab',
        description: 'Retrieve a lab by ID. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'Lab object',
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          '404': { description: 'Lab not found' },
          '401': { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Delete a lab',
        description: 'Delete a lab by ID. Requires HTTP Basic Auth.',
        security: [{ basicAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Lab deleted' },
          '404': { description: 'Lab not found' },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/upload_document': {
      post: {
        summary: 'Upload a DOCX file to extract text',
        description: 'Uploads a .docx file and extracts its raw text content.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  outline: {
                    type: 'file',
                    description: 'The .docx file to upload',
                    format: 'binary',
                  },
                },
                required: ['outline'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Extracted text from the DOCX file',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: {
                      type: 'string',
                      description: 'The extracted raw text content of the DOCX file.',
                    },
                  },
                },
              },
            },
          },
          '400': { description: 'Invalid file type or missing file' },
          '500': { description: 'Internal server error' },
        },
      },
    },
    '/api/generate_lab_from_documents': {
      post: {
        summary: 'Generate a lab from uploaded document chunks',
        description: 'Generates a lab (interactive or project-based) from uploaded document chunks, lesson topic, and other metadata.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  outlineChunks: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of strings representing the outline document chunks.'
                  },
                  blueprintChunks: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Optional array of strings representing the blueprint document chunks.'
                  },
                  lesson_topic: {
                    type: 'string',
                    description: 'The specific lesson topic for the lab.'
                  },
                  target_audience: {
                    type: 'string',
                    description: 'Target audience for the lab (default: "beginners").',
                    default: 'beginners'
                  },
                  duration: {
                    type: 'string',
                    description: 'Expected duration of the lab (default: "1-2 hours").',
                    default: '1-2 hours'
                  },
                  lab_type: {
                    type: 'string',
                    description: 'Type of lab to generate (interactive, gamified, project-based).',
                    enum: ['interactive', 'gamified', 'project-based'],
                    default: 'interactive'
                  },
                  project_theme: {
                    type: 'string',
                    description: 'Optional theme for project-based lab.'
                  }
                },
                required: ['outlineChunks', 'lesson_topic']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Generated lab content',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    requirements: { type: 'string', description: 'Generated requirements' },
                    outline: { type: 'string', description: 'Generated outline' },
                    lab: { type: 'string', description: 'Generated lab content' }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid input' },
          '500': { description: 'Internal server error' }
        }
      }
    },
    '/api/summarize_document_chunks': {
      post: {
        summary: 'Summarize document chunks',
        description: 'Summarizes each chunk of a document, then summarizes the summaries to produce a final summary that fits within model context limits.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  chunks: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of text chunks to summarize.'
                  }
                },
                required: ['chunks']
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Summaries of each chunk and a final summary',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    chunkSummaries: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Summaries of each chunk.'
                    },
                    finalSummary: {
                      type: 'string',
                      description: 'A single summary of all chunk summaries.'
                    }
                  }
                }
              }
            }
          },
          '400': { description: 'Invalid input' },
          '500': { description: 'Internal server error' }
        }
      }
    },
  },
  components: {
    securitySchemes: {
      basicAuth: {
        type: 'http',
        scheme: 'basic',
      },
    },
  },
};
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(express.json());

// Create a single instance of the lab generator
const generator = new MLLabGenerator();

// Set up multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

const hierarchicalProcessor = new HierarchicalDocumentProcessor(generator);
const semanticProcessor = new SemanticDocumentProcessor(generator);

type DocumentContext = {
  summary: string;
  documentType: string;
  keyTopics: string[];
  keyInsights: string[];
  realWorldExamples: string[];
  structure: string;
  requirements: string;
  estimatedComplexity: string;
};

function buildComprehensiveContext(processedDocument: any, focusAreas: string[] = []): DocumentContext {
  const context: DocumentContext = {
    summary: processedDocument.finalSummary || '',
    documentType: processedDocument.structure?.documentType || 'general',
    keyTopics: [],
    keyInsights: [],
    realWorldExamples: [],
    structure: '',
    requirements: '',
    estimatedComplexity: 'medium'
  };

  // Extract key topics
  if (processedDocument.sections) {
    context.keyTopics = processedDocument.sections.map((s: any) => s.title);
    context.keyInsights = processedDocument.sections
      .filter((s: any) => s.keyConcepts && s.keyConcepts.length > 0)
      .flatMap((s: any) => s.keyConcepts)
      .slice(0, 10);
  }

  // Build requirements from document content
  context.requirements = `
Document Type: ${context.documentType}
Main Topics: ${context.keyTopics.join(', ')}
Key Concepts: ${context.keyInsights.join(', ')}
Document Summary: ${context.summary}
${focusAreas.length > 0 ? `Focus Areas: ${focusAreas.join(', ')}` : ''}
`;

  // Estimate complexity based on content
  const complexityIndicators = [
    'algorithm', 'implementation', 'advanced', 'complex', 'optimization',
    'theoretical', 'mathematical', 'statistical', 'neural', 'deep'
  ];
  
  const contentText = processedDocument.finalSummary?.toLowerCase() || '';
  const complexityScore = complexityIndicators.filter(indicator => 
    contentText.includes(indicator)
  ).length;
  
  context.estimatedComplexity = complexityScore > 3 ? 'advanced' : 
                               complexityScore > 1 ? 'intermediate' : 'beginner';

  return context;
}


function findRelevantSections(processedDocument: any, query: string, contextWindow: number = 3): any[] {
  const sections = processedDocument.sections || [];
  const queryLower = query.toLowerCase();
  
  // Score sections based on query relevance
  const scoredSections = sections.map((section: any) => {
    const titleScore = section.title.toLowerCase().includes(queryLower) ? 2 : 0;
    const summaryScore = section.summary?.toLowerCase().includes(queryLower) ? 1 : 0;
    const conceptScore = section.keyConcepts?.some((concept: string) => 
      concept.toLowerCase().includes(queryLower)) ? 1 : 0;
    
    return {
      ...section,
      relevanceScore: titleScore + summaryScore + conceptScore
    };
  }).sort((a: any, b: any) => b.relevanceScore - a.relevanceScore);

  // Return top sections within context window
  return scoredSections.slice(0, contextWindow);
}

async function generateContextualAnswer(sections: any[], query: string): Promise<string> {
  const context = sections.map(s => 
    `Section: ${s.title}\nSummary: ${s.summary}\nKey Concepts: ${s.keyConcepts?.join(', ')}`
  ).join('\n\n');

  const prompt = `Based on the following document sections, answer this query: "${query}"

Context:
${context}

Provide a comprehensive answer that:
1. Directly addresses the query
2. References specific sections when relevant
3. Provides practical insights
4. Maintains accuracy to the source material
`;

  const result = await generator.summarizeChunk({ text: prompt });
  return result.content[0].text || '';
}

// --- LAB STORAGE SETUP ---
const LABS_FILE = path.join(__dirname, 'labs.json');
type Lab = {
  id: string;
  labType: string;
  requirements: string;
  lessonTopic: string;
  audience: string;
  duration: string;
  content: string;
  createdAt: string;
  author: string;
};
function readLabs(): Lab[] {
  if (!fs.existsSync(LABS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(LABS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}
function writeLabs(labs: Lab[]) {
  fs.writeFileSync(LABS_FILE, JSON.stringify(labs, null, 2));
}

// --- AUTH MIDDLEWARE ---
function basicAuth(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Labs"');
    return res.status(401).send('Authentication required');
  }
  const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (user !== 'admin' || pass !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
}

// --- LAB ENDPOINTS ---
app.post('/api/save_lab', basicAuth, (req: Request, res: Response) => {
  const { labType, requirements, lessonTopic, audience, duration, content } = req.body;
  if (!labType || !requirements || !lessonTopic || !audience || !duration || !content) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const labs = readLabs();
  const lab: Lab = {
    id: uuidv4(),
    labType,
    requirements,
    lessonTopic,
    audience,
    duration,
    content,
    createdAt: new Date().toISOString(),
    author: 'admin',
  };
  labs.push(lab);
  writeLabs(labs);
  res.json({ success: true, lab });
});

app.get('/api/labs', basicAuth, (req: Request, res: Response) => {
  const labs = readLabs();
  res.json(labs);
});

app.get('/api/labs/:id', basicAuth, (req: Request, res: Response) => {
  const labs = readLabs();
  const lab = labs.find((l: Lab) => l.id === req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });
  res.json(lab);
});

app.delete('/api/labs/:id', basicAuth, (req: Request, res: Response) => {
  let labs = readLabs();
  const idx = labs.findIndex((l: Lab) => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Lab not found' });
  const [deleted] = labs.splice(idx, 1);
  writeLabs(labs);
  res.json({ success: true, deleted });
});

app.post('/api/read_requirements', async (req: Request, res: Response) => {
  try {
    const result = await generator.readRequirements(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_lab_outline', basicAuth,async (req: Request, res: Response) => {
  try {
    const result = await generator.generateLabOutline(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_interactive_lab', basicAuth,async (req: Request, res: Response) => {
  try {
    const result = await generator.generateInteractiveLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_gamified_lab', basicAuth,async (req: Request, res: Response) => {
  try {
    const result = await generator.generateGamifiedLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_project_based_lab',basicAuth, async (req: Request, res: Response) => {
  try {
    const result = await generator.generateProjectBasedLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/review_lab_quality', basicAuth,async (req: Request, res: Response) => {
  try {
    const result = await generator.reviewLabQuality(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/test_lab_effectiveness', basicAuth,async (req: Request, res: Response) => {
  try {
    const result = await generator.testLabEffectiveness(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_assessment_rubric',basicAuth, async (req: Request, res: Response) => {
  try {
    const result = await generator.generateAssessmentRubric(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/optimize_lab_content',basicAuth, async (req: Request, res: Response) => {
  try {
    const result = await generator.optimizeLabContent(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/export_lab_pdf',basicAuth, async (req: Request, res: Response) => {
  try {
    const { content, filename = 'lab.pdf' } = req.body;
    const result = await generator.exportLabPDF({ content });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.buffer);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/export_lab_docx',basicAuth, async (req: Request, res: Response) => {
  try {
    const { content, filename = 'lab.docx' } = req.body;
    const result = await generator.exportLabDOCX({ content });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(result.buffer);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_lab_from_documents', basicAuth, async (req: Request, res: Response) => {
  try {
    const { outlineChunks, blueprintChunks, lesson_topic, target_audience = 'beginners', duration = '1-2 hours', lab_type = 'interactive', project_theme } = req.body;
    if (!outlineChunks || !Array.isArray(outlineChunks) || outlineChunks.length === 0) {
      return res.status(400).json({ error: 'outlineChunks (array of strings) is required' });
    }
    // Optionally, blueprintChunks can be used for more context
    const outlineText = outlineChunks.join('\n');
    const blueprintText = blueprintChunks && Array.isArray(blueprintChunks) ? blueprintChunks.join('\n') : '';
    // Step 1: Analyze requirements (using both outline and blueprint if available)
    const requirements = blueprintText ? `${outlineText}\n\nBlueprint:\n${blueprintText}` : outlineText;
    const requirementsResult = await generator.readRequirements({
      requirements,
      lesson_topic,
      target_audience,
      duration
    });
    // Step 2: Generate lab outline
    const outlineResult = await generator.generateLabOutline({
      lesson_topic,
      requirements_analysis: requirementsResult.content[0].text,
      outline_type: lab_type
    });
    // Step 3: Generate lab content (interactive or project-based)
    let labResult;
    if (lab_type === 'project-based') {
      labResult = await generator.generateProjectBasedLab({
        outline: outlineResult.content[0].text,
        project_theme: project_theme || 'general',
        complexity_level: 'beginner',
        deliverables: ['analysis_report', 'working_model']
      });
    } else {
      labResult = await generator.generateInteractiveLab({
        outline: outlineResult.content[0].text,
        interactivity_level: 'high',
        include_code: true,
        reflection_questions: true
      });
    }
    res.json({
      requirements: requirementsResult.content[0].text,
      outline: outlineResult.content[0].text,
      lab: labResult.content[0].text
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- DOCUMENT UPLOAD ENDPOINT ---

app.post('/api/upload_document_enhanced', basicAuth, upload.single('document'), async (req: Request, res: Response) => {
  const file = (req as Request & { file?: Express.Multer.File }).file;
  const processingType = req.body.processingType || 'hierarchical'; // 'hierarchical' or 'semantic'
  
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  let tempFilePath = '';
  try {
    let text = '';
    
    // Extract text from file
    if (file.originalname.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      text = result.value;
    } else if (file.originalname.endsWith('.pdf')) {
      tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}_${Math.random()}.pdf`);
      await fsPromises.writeFile(tempFilePath, file.buffer);
      
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const pdfBuffer = await fsPromises.readFile(tempFilePath);
      const result = await pdfParse(pdfBuffer);
      text = result.text;
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text content found in the uploaded file' });
    }

    // Process document based on type
    let processingResult;
    
    if (processingType === 'semantic') {
      processingResult = await semanticProcessor.processDocumentSemantically(text);
    } else {
      processingResult = await hierarchicalProcessor.processDocument(text);
    }

    res.json({
      success: true,
      filename: file.originalname,
      size: file.size,
      processingType,
      originalLength: text.length,
      ...processingResult
    });

  } catch (err) {
    console.error('Document processing error:', err);
    res.status(500).json({ error: (err as Error).message });
  } finally {
    if (tempFilePath) {
      try {
        await fsPromises.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error('Failed to clean up temporary file:', unlinkError);
      }
    }
  }
});

app.post('/api/generate_lab_from_processed_document', basicAuth, async (req: Request, res: Response) => {
  try {
    const { 
      processedDocument, 
      lesson_topic, 
      target_audience = 'beginners', 
      duration = '1-2 hours', 
      lab_type = 'interactive',
      project_theme,
      focus_areas = [] // Array of specific areas to focus on
    } = req.body;

    if (!processedDocument || !lesson_topic) {
      return res.status(400).json({ error: 'processedDocument and lesson_topic are required' });
    }

    // Build comprehensive context from processed document
    const context = buildComprehensiveContext(processedDocument, focus_areas);
    
    // Generate requirements analysis with enhanced context
    const requirementsResult = await generator.readRequirements({
      requirements: context.requirements,
      lesson_topic,
      target_audience,
      duration
    });

    // Generate lab outline with document structure awareness
    const outlineResult = await generator.generateLabOutline({
      lesson_topic,
      requirements_analysis: requirementsResult.content[0].text,
      outline_type: lab_type,
      document_structure: context.structure
    });

    // Generate final lab content
    let labResult;
    if (lab_type === 'project-based') {
      labResult = await generator.generateProjectBasedLab({
        outline: outlineResult.content[0].text,
        project_theme: project_theme || 'general',
        complexity_level: target_audience === 'beginners' ? 'beginner' : 'intermediate',
        deliverables: ['analysis_report', 'working_model'],
        real_world_context: context.realWorldExamples
      });
    } else {
      labResult = await generator.generateInteractiveLab({
        outline: outlineResult.content[0].text,
        interactivity_level: 'high',
        include_code: true,
        reflection_questions: true,
        document_insights: context.keyInsights
      });
    }

    res.json({
      success: true,
      context: context.summary,
      requirements: requirementsResult.content[0].text,
      outline: outlineResult.content[0].text,
      lab: labResult.content[0].text,
      metadata: {
        document_type: context.documentType,
        key_topics: context.keyTopics,
        estimated_complexity: context.estimatedComplexity
      }
    });

  } catch (err) {
    console.error('Lab generation error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/query_document', basicAuth, async (req: Request, res: Response) => {
  try {
    const { processedDocument, query, context_window = 3 } = req.body;

    if (!processedDocument || !query) {
      return res.status(400).json({ error: 'processedDocument and query are required' });
    }

    // Find relevant sections
    const relevantSections = findRelevantSections(processedDocument, query, context_window);
    
    // Generate contextual answer
    const answer = await generateContextualAnswer(relevantSections, query);

    res.json({
      success: true,
      query,
      answer,
      relevantSections: relevantSections.map(s => ({
        title: s.title,
        summary: s.summary,
        relevanceScore: s.relevanceScore
      })),
      sources: relevantSections.map(s => s.title)
    });

  } catch (err) {
    console.error('Document query error:', err);
    res.status(500).json({ error: (err as Error).message });
  }
});

// --- SUMMARIZATION PIPELINE ENDPOINT ---
app.post('/api/summarize_document_chunks', basicAuth, async (req: Request, res: Response) => {
  const { chunks } = req.body;
  if (!chunks || !Array.isArray(chunks)) {
    return res.status(400).json({ error: 'chunks (array of strings) is required' });
  }
  try {
    // 1. Summarize each chunk
    const chunkSummaries: string[] = [];
    for (const chunk of chunks) {
      const summaryResult = await generator.summarizeChunk({ text: chunk });
      chunkSummaries.push(summaryResult.content[0].text ?? "");
    }
    // 2. Concatenate summaries and summarize again
    const allSummaries = chunkSummaries.join('\n');
    const finalSummaryResult = await generator.summarizeChunk({ text: allSummaries });
    const finalSummary = finalSummaryResult.content[0].text;
    res.json({ chunkSummaries, finalSummary });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`ML Lab Generator HTTP API running at http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
});