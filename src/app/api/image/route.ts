
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referrer-Policy': 'no-referrer',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow', // Explicitly follow redirects
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Log the error response from Google
      console.error(`Failed to fetch image from Google Drive. Status: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error("Response Body:", errorBody);
      return new NextResponse(`Failed to fetch image. Status: ${response.status}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable', // Cache for a week
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    if (error instanceof Error) {
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse('An internal server error occurred', { status: 500 });
  }
}
