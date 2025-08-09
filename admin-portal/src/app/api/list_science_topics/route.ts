import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Use localhost for development, fallback to Docker hostname for production

const MCP_SERVER_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;

  console.log('Connecting to MCP server at:', MCP_SERVER_URL);
  
  const res = await fetch(MCP_SERVER_URL + '/api/list_science_topics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from('admin:admin').toString('base64'),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}
