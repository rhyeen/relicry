import 'server-only';
import { NextResponse } from 'next/server';
import { isEmulated } from '@/lib/environment';
import { handleOkResponse } from '@/server/routeHelpers';
import { revalidateLocalData } from '@/server/localCache';

export async function POST() {
  // Prevent cache flushes in production
  if (!isEmulated) return NextResponse.json({ ok: false, error: 'Not allowed in production' }, { status: 403 });
  revalidateLocalData();
  return handleOkResponse();
}
