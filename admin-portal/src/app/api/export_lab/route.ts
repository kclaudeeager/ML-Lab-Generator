import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { content, filename = 'lab.md' } = await req.json();
  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/markdown',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
