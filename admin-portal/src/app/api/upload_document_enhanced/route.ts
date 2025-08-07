import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  // Forward the form data to MCP internal endpoint
  const res = await fetch((process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL) + '/upload_document_enhanced', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from('admin:admin').toString('base64'),
    },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data);
}
