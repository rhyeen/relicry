import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { isEmulated } from '@/lib/environment';
import {
  buildDownloadUnpublishedUniqueRewardHref,
  buildRewardHref,
  isLocalRequestHost,
  normalizeUnpublishedModeSP,
  normalizeUnpublishedCursorSP,
  normalizeUnpublishedRewardEventIdSP,
  normalizeUnpublishedRewardLevelSP,
} from '@/lib/unpublishedDownload';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { UniqueRewardDB } from '@/server/db/uniqueReward.db';

type DownloadUnpublishedUniqueRewardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DownloadUnpublishedUniqueRewardPage(
  { searchParams }: DownloadUnpublishedUniqueRewardPageProps
) {
  return (
    <Suspense fallback={null}>
      <DownloadUnpublishedUniqueRewardPageData searchParams={searchParams} />
    </Suspense>
  );
}

async function DownloadUnpublishedUniqueRewardPageData(
  { searchParams }: DownloadUnpublishedUniqueRewardPageProps
) {
  await connection();
  const hostHeader = (await headers()).get('host');
  if (!isEmulated && !isLocalRequestHost(hostHeader)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const cursor = normalizeUnpublishedCursorSP(resolvedSearchParams);
  const mode = normalizeUnpublishedModeSP(resolvedSearchParams);
  const eventId = normalizeUnpublishedRewardEventIdSP(resolvedSearchParams);
  const level = normalizeUnpublishedRewardLevelSP(resolvedSearchParams);

  if (!eventId || !level) {
    notFound();
  }

  const db = new UniqueRewardDB(getFirestoreAdmin());

  const result = mode === 'current' && cursor
    ? {
      uniqueReward: await db.getByStoredDocId(cursor),
      cursor,
    }
    : await db.getNextUnpublishedByRewardAfter(eventId, level, cursor);

  if (!result.uniqueReward || !result.cursor) {
    redirect(buildRewardHref({
      eventId,
      level,
    }));
  }

  return redirect(buildDownloadUnpublishedUniqueRewardHref({
    id: result.uniqueReward.id,
    cursor: result.cursor,
  }));
}
