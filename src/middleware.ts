import { proxy, config } from '@/lib/proxy';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  return proxy(req);
}

export { config };
