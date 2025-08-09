import { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL =process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${MCP_SERVER_URL}/api/get_simulation_template`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64'),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MCP Server error:', errorText);
      return NextResponse.json(
        { error: `MCP Server error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Failed to get simulation template' },
      { status: 500 }
    );
  }
}
