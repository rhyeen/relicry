import 'server-only';
import { populateLocal } from '@/server/db/local.db';
import { isEmulated } from '@/lib/environment';
import { handleJsonResponse } from '@/server/routeHelpers';
import { normalizeLocalCardCount } from '@/lib/localPopulate';
import { revalidateLocalData } from '@/server/localCache';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  if (!isEmulated) {
    return NextResponse.json({ ok: false, error: 'Not allowed in production' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const cardCount = normalizeLocalCardCount(
    body && typeof body === 'object' && 'cardCount' in body
      ? body.cardCount
      : undefined,
  );

  const result = await populateLocal({ cardCount });
  revalidateLocalData();

  return handleJsonResponse({
    ok: true,
    cardCount: result.cardCount,
  });
}
