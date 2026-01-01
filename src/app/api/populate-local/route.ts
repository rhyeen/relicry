import 'server-only';
import { NextResponse } from 'next/server';
import { populateLocal } from '@/server/db/local.db';

export async function POST() {
  await populateLocal();
  return NextResponse.json({ ok: true });
}
