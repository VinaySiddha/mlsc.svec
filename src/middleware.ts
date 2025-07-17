import { NextRequest, NextResponse } from 'next/server';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (ADMIN_USERNAME && ADMIN_PASSWORD) {
      const basicAuth = req.headers.get('authorization');
      if (basicAuth) {
        const authValue = basicAuth.split(' ')[1];
        const [user, pwd] = atob(authValue).split(':');

        if (user === ADMIN_USERNAME && pwd === ADMIN_PASSWORD) {
          return NextResponse.next();
        }
      }
      
      const url = req.nextUrl;
      url.pathname = '/api/auth';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};