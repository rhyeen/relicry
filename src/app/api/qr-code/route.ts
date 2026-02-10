import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if (!path) {
    return new NextResponse('Missing ?path=', { status: 400 });
  }
  const cacheBuster = searchParams.get('cb');
  // Do not include www. in the generated URL
  let origin = req.nextUrl.origin.replace(/^https?:\/\/(www\.)?/, 'https://');
  // @NOTE: Uppercase makes it so QR codes use a more efficient encoding mode
  // So the code is smaller
  if (origin.includes('://0.0.0.0')) {
    origin = (process.env.NEXT_PUBLIC_SITE_URL ?? origin.replace('0.0.0.0', 'relicry.com'));
  }
  const url = new URL(path, origin).toString().toUpperCase();
  if (cacheBuster) {
    console.info(`Cache buster present: ${cacheBuster}`);
    console.info(`Generating QR code for URL: ${url}`);
  }
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    scale: 3,
  });
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Cache aggressively since QR codes are immutable
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
