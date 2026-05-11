import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { isEmulated } from '@/lib/environment';
import {
  buildDownloadUnpublishedCardHref,
  isLocalRequestHost,
  normalizeUnpublishedModeSP,
  normalizeUnpublishedCursorSP,
} from '@/lib/unpublishedDownload';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { CardDB } from '@/server/db/card.db';

type DownloadUnpublishedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DownloadUnpublishedPage(
  { searchParams }: DownloadUnpublishedPageProps
) {
  return (
    <Suspense fallback={null}>
      <DownloadUnpublishedPageData searchParams={searchParams} />
    </Suspense>
  );
}

async function DownloadUnpublishedPageData(
  { searchParams }: DownloadUnpublishedPageProps
) {
  await connection();
  const hostHeader = (await headers()).get('host');
  if (!isEmulated && !isLocalRequestHost(hostHeader)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const cursor = normalizeUnpublishedCursorSP(resolvedSearchParams);
  const mode = normalizeUnpublishedModeSP(resolvedSearchParams);
  const db = new CardDB(getFirestoreAdmin());

  const result = mode === 'current' && cursor
    ? {
      card: await db.getByStoredDocId(cursor),
      cursor,
    }
    : await db.getNextUnpublishedAfter(cursor);

  if (!result.card || !result.cursor) {
    redirect('/cards');
  }

  return redirect(buildDownloadUnpublishedCardHref({
    cardId: result.card.id,
    version: result.card.version,
    cursor: result.cursor,
  }));
}
