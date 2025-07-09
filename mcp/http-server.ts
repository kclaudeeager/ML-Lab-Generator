import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { MLLabGenerator } from './server.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

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

app.post('/api/read_requirements', async (req, res) => {
  try {
    const result = await generator.readRequirements(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_lab_outline', async (req, res) => {
  try {
    const result = await generator.generateLabOutline(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_interactive_lab', async (req, res) => {
  try {
    const result = await generator.generateInteractiveLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_gamified_lab', async (req, res) => {
  try {
    const result = await generator.generateGamifiedLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_project_based_lab', async (req, res) => {
  try {
    const result = await generator.generateProjectBasedLab(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/review_lab_quality', async (req, res) => {
  try {
    const result = await generator.reviewLabQuality(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/test_lab_effectiveness', async (req, res) => {
  try {
    const result = await generator.testLabEffectiveness(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/generate_assessment_rubric', async (req, res) => {
  try {
    const result = await generator.generateAssessmentRubric(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/optimize_lab_content', async (req, res) => {
  try {
    const result = await generator.optimizeLabContent(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post('/api/export_lab_pdf', async (req, res) => {
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

app.post('/api/export_lab_docx', async (req, res) => {
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

app.listen(port, () => {
  console.log(`ML Lab Generator HTTP API running at http://localhost:${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
});