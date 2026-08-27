import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic") || "javascript";

    const response = await fetch(`${BACKEND_URL}/api/generate-quiz?topic=${encodeURIComponent(topic)}`);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in Next.js quiz proxy (GET):", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
