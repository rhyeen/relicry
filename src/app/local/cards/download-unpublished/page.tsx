import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { isEmulated } from '@/lib/environment';
import {
  buildDownloadUnpublishedCardHref,
  isLocalRequestHost,
  normalizeUnpublishedHistorySP,
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
  const hostHeader = (await headers()).get('host');
  if (!isEmulated && !isLocalRequestHost(hostHeader)) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const cursor = normalizeUnpublishedCursorSP(resolvedSearchParams);
  const history = normalizeUnpublishedHistorySP(resolvedSearchParams);
  const mode = normalizeUnpublishedModeSP(resolvedSearchParams);
  const db = new CardDB(getFirestoreAdmin());

  const result = mode === 'current' && cursor
    ? {
      card: await db.getByStoredDocId(cursor),
      cursor,
      history,
    }
    : await (async () => {
      const next = await db.getNextUnpublishedAfter(cursor);
      return {
        ...next,
        history: cursor ? [...history, cursor] : history,
      };
    })();

  if (!result.card || !result.cursor) {
    redirect('/cards');
  }

  redirect(buildDownloadUnpublishedCardHref({
    cardId: result.card.id,
    version: result.card.version,
    cursor: result.cursor,
    history: result.history,
  }));
}
