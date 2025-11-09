import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// Lightweight PDF viewer - redirects to public files
// This uses Edge Runtime to keep function size minimal
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

    // Redirect to the public file with proper headers
    const baseUrl = new URL(request.url).origin;
    const fileUrl = `${baseUrl}${path}`;
    
    return NextResponse.redirect(fileUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to load PDF' }, { status: 500 });
  }
}


