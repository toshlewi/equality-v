import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

// POST /api/uploads/direct - Uploads a file via server to storage, returns public URL
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const meta = await uploadFile(buffer, file.name, { folder, contentType: file.type });

    return NextResponse.json({ success: true, data: { url: meta.url, name: meta.name } });
  } catch (error) {
    console.error('Direct upload failed:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}


