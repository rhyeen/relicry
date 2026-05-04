'use client';

import { buildDownloadUnpublishedRedirectHref } from '@/lib/unpublishedDownload';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
  enabled: boolean;
  awakened: boolean;
  isFocus: boolean;
  cursor: string | null;
  history: string[];
};

export default function DownloadUnpublishedAdvance({
  enabled,
  awakened,
  isFocus,
  cursor,
  history,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft')
        || event.repeat
        || event.altKey
        || event.ctrlKey
        || event.metaKey
        || event.shiftKey
      ) {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLElement
        && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
      ) {
        return;
      }

      event.preventDefault();

      if (event.key === 'ArrowLeft') {
        const previousCursor = history[history.length - 1] ?? null;
        if (!previousCursor) {
          return;
        }

        window.location.assign(
          buildDownloadUnpublishedRedirectHref({
            cursor: previousCursor,
            history: history.slice(0, -1),
            mode: 'current',
          })
        );
        return;
      }

      if (isFocus && !awakened) {
        const nextParams = new URLSearchParams(searchParams.toString());
        nextParams.set('awakened', 'true');
        router.push(`${pathname}?${nextParams.toString()}`);
        return;
      }

      if (!cursor) {
        return;
      }

      window.location.assign(buildDownloadUnpublishedRedirectHref({
        cursor,
        history,
        mode: 'next',
      }));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [awakened, cursor, enabled, history, isFocus, pathname, router, searchParams]);

  return null;
}
