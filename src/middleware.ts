
import { NextRequest, NextResponse } from 'next/server';
import { getPanels } from './app/actions';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Check for main admin
      if (user === ADMIN_USERNAME && pwd === ADMIN_PASSWORD) {
        return NextResponse.next();
      }

      // Check for panel admins
      const panels = await getPanels();
      const matchedPanel = panels.find(p => p.username === user && p.password === pwd);
      
      if (matchedPanel) {
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set('X-Panel-Domain', matchedPanel.domain);
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    }
    
    const url = req.nextUrl;
    url.pathname = '/api/auth';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
