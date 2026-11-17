import { NextRequest, NextResponse } from 'next/server';
import { HeavyStorage } from '@/lib/new-storage/storage';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await HeavyStorage.upload(buffer, file.name, file.type, folder);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    console.error('Storage upload failed:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
