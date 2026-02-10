import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  const lowerPath = req.nextUrl.pathname.toLowerCase();
  if (req.nextUrl.pathname !== lowerPath) {
    const url = req.nextUrl.clone();
    url.pathname = lowerPath;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
