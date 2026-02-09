import 'server-only';
import { populateLocal } from '@/server/db/local.db';
import { handleOkResponse } from '@/server/routeHelpers';

export async function POST() {
  await populateLocal();
  return handleOkResponse();
}
