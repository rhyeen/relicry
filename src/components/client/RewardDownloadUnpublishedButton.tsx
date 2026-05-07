'use client';

import DSButton from '@/components/ds/DSButton';
import {
  buildDownloadUnpublishedUniqueRewardRedirectHref,
  DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY,
  isLocalHostname,
} from '@/lib/unpublishedDownload';
import { useSyncExternalStore } from 'react';

type Props = {
  eventId: string;
  level: number;
};

export default function RewardDownloadUnpublishedButton({ eventId, level }: Props) {
  const isLocal = useSyncExternalStore(
    () => () => undefined,
    () => isLocalHostname(window.location.hostname),
    () => false,
  );

  if (!isLocal) {
    return null;
  }

  const handleDownloadUnpublished = () => {
    window.localStorage.removeItem(DOWNLOAD_UNPUBLISHED_UNIQUE_REWARD_HISTORY_STORAGE_KEY);
    window.location.assign(buildDownloadUnpublishedUniqueRewardRedirectHref({
      eventId,
      level,
    }));
  };

  return (
    <DSButton
      onClick={handleDownloadUnpublished}
      label="Download Unpublished"
    />
  );
}
