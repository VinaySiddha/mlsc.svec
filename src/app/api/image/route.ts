
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Image URL is required', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            'Referrer-Policy': 'no-referrer',
        },
    });

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
