import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { isEmulated } from '@/lib/environment';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { handleOkResponse } from '@/server/routeHelpers';

export async function POST() {
  // Prevent cache flushes in production
  if (!isEmulated) return NextResponse.json({ ok: false, error: 'Not allowed in production' }, { status: 403 });
  // Flush Local Cache of all data
  revalidateTag(LOCAL_CACHE_TAG, { expire: 0 });
  // Flush Route Cache for the root layout and everything underneath
  revalidatePath('/', 'layout');
  return handleOkResponse();
}
