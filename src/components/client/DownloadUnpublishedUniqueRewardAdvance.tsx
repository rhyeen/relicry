'use client';

import {
  buildDownloadUnpublishedUniqueRewardRedirectHref,
  DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY,
} from '@/lib/unpublishedDownload';
import { useEffect } from 'react';

type Props = {
  enabled: boolean;
  eventId: string;
  level: number;
  cursor: string | null;
};

function readUnpublishedHistory(): string[] {
  try {
    const raw = window.localStorage.getItem(DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
      : [];
  } catch {
    return [];
  }
}

function writeUnpublishedHistory(history: string[]) {
  window.localStorage.setItem(DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export default function DownloadUnpublishedUniqueRewardAdvance({
  enabled,
  eventId,
  level,
  cursor,
}: Props) {
  useEffect(() => {
    if (!enabled) return;

    if (window.localStorage.getItem(DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY) === null) {
      writeUnpublishedHistory([]);
    }
  }, [enabled]);

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
        const history = readUnpublishedHistory();
        const previousCursor = history[history.length - 1] ?? null;
        if (!previousCursor) {
          return;
        }

        writeUnpublishedHistory(history.slice(0, -1));
        window.location.assign(buildDownloadUnpublishedUniqueRewardRedirectHref({
          eventId,
          level,
          cursor: previousCursor,
          mode: 'current',
        }));
        return;
      }

      if (!cursor) {
        return;
      }

      writeUnpublishedHistory([...readUnpublishedHistory(), cursor]);
      window.location.assign(buildDownloadUnpublishedUniqueRewardRedirectHref({
        eventId,
        level,
        cursor,
        mode: 'next',
      }));
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [cursor, enabled, eventId, level]);

  return null;
}
