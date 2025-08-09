import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const MCP_SERVER_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const compilerOptions = {
      target: 'ES2020',
      lib: ['ES2020', 'DOM'],
      strict: true,
      types: ['node'],
      typeRoots: ['node_modules/@types'],
    };

    const response = await fetch(`${MCP_SERVER_URL}/api/compile_typescript`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Basic ' + Buffer.from('admin:admin').toString('base64'),
      },
      body: JSON.stringify({
        ...body,
        compilerOptions,
        prelude: `
          declare namespace Simulation {
            interface Variable {
              name: string;
              type: string;
              options?: string[];
              min?: number;
              max?: number;
              step?: number;
            }

            interface Meta {
              title: string;
              description?: string;
              subject: string;
              gradeLevel: string;
              time?: number;
              difficulty?: string;
              curriculumStandards?: string[];
              learningObjectives: string[];
              variables: Variable[];
            }
          }

          declare global {
            const console: Console;
            const Math: Math;
            
            interface Window {
              requestAnimationFrame(callback: FrameRequestCallback): number;
            }
            const window: Window;
            
            interface Document {
              createElement(tagName: 'canvas'): HTMLCanvasElement;
            }
            const document: Document;
            
            interface HTMLElement {
              style: CSSStyleDeclaration;
            }
            
            interface HTMLCanvasElement extends HTMLElement {
              getContext(contextId: '2d'): CanvasRenderingContext2D;
              width: number;
              height: number;
            }

            interface CanvasRenderingContext2D {
              font: string;
              fillStyle: string | CanvasGradient | CanvasPattern;
              strokeStyle: string | CanvasGradient | CanvasPattern;
              textAlign: CanvasTextAlign;
              textBaseline: CanvasTextBaseline;
              lineWidth: number;
              clearRect(x: number, y: number, width: number, height: number): void;
              fillText(text: string, x: number, y: number): void;
              fillRect(x: number, y: number, width: number, height: number): void;
              beginPath(): void;
              moveTo(x: number, y: number): void;
              lineTo(x: number, y: number): void;
              stroke(): void;
            }

            type SimulationMeta = Simulation.Meta;
          }
        `,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MCP Server error:', errorText);
      return NextResponse.json(
        {
          error: `MCP Server error: ${response.status} ${errorText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to compile TypeScript code' },
      { status: 500 }
    );
  }
}