import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl.clone();

  // Enforce www.eulerfold.com
  if (
    process.env.NODE_ENV === 'production' &&
    host &&
    host === 'eulerfold.com'
  ) {
    url.host = 'www.eulerfold.com';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

// Add matcher for efficiency - exclude static files, api routes, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
