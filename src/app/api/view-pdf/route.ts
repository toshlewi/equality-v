import { NextRequest, NextResponse } from 'next/server';
import { createReadStream, statSync } from 'fs';
import { join, normalize } from 'path';

export const runtime = 'nodejs';

// Streams a PDF from the public folder with proper headers for inline viewing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let path = searchParams.get('path') || '';

    // If a full URL was provided, extract pathname
    if (path.startsWith('http://') || path.startsWith('https://')) {
      try {
        const u = new URL(path);
        path = u.pathname;
      } catch {}
    }

    // Basic validation: only allow files under /uploads or /files
    if (!path.startsWith('/uploads/') && !path.startsWith('/files/')) {
      return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 400 });
    }

    // Resolve to public directory
    const publicDir = join(process.cwd(), 'public');
    const resolvedPath = normalize(join(publicDir, path));

    if (!resolvedPath.startsWith(publicDir)) {
      return NextResponse.json({ success: false, error: 'Path traversal detected' }, { status: 400 });
    }

    // Ensure file exists and is a PDF
    const stats = statSync(resolvedPath);
    if (!stats.isFile()) {
      return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
    }

    // Stream the file with headers that allow iframe viewing
    const stream = createReadStream(resolvedPath);
    const filename = resolvedPath.split(/[/\\]/).pop() || 'document.pdf';
    const response = new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': stats.size.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cross-Origin-Resource-Policy': 'same-origin',
        'Cache-Control': 'public, max-age=3600',
      },
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load PDF' }, { status: 500 });
  }
}


