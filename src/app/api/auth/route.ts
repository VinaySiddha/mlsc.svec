import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
