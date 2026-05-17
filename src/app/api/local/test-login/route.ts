import 'server-only';

import { getAppAdmin } from '@/lib/firebaseAdmin';
import { isEmulated } from '@/lib/environment';
import { populateLocal } from '@/server/db/local.db';
import { revalidateLocalData } from '@/server/localCache';
import { userTestIds } from '@/server/db/test-data/user.data';
import { NextResponse } from 'next/server';

const TEST_USER_UID = `test-firebase-${userTestIds.user1}`;
const TEST_USER_EMAIL = 'testuser1@example.com';
const LOCAL_TEST_LOGIN_CARD_COUNT = 6;

export async function POST() {
  if (!isEmulated) {
    return NextResponse.json({ ok: false, error: 'Not allowed in production' }, { status: 403 });
  }

  const auth = getAppAdmin().auth();
  await populateLocal({ cardCount: LOCAL_TEST_LOGIN_CARD_COUNT });
  revalidateLocalData();

  try {
    await auth.getUser(TEST_USER_UID);
  } catch {
    await auth.createUser({
      uid: TEST_USER_UID,
      email: TEST_USER_EMAIL,
      emailVerified: true,
      displayName: 'Test User 1',
    });
  }

  return NextResponse.json({
    ok: true,
    token: await auth.createCustomToken(TEST_USER_UID),
  });
}
