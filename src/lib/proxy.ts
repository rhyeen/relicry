import { NextRequest, NextResponse } from 'next/server';

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname !== req.nextUrl.pathname.toLowerCase()) {
    return NextResponse.redirect(
      new URL(req.nextUrl.origin + req.nextUrl.pathname.toLowerCase())
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
