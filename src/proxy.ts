import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }
  const lowerPath = pathname.toLowerCase();
  if (pathname !== lowerPath) {
    const url = req.nextUrl.clone();
    url.pathname = lowerPath;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
