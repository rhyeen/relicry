"use client";

import { AdminRole, hasRole } from "@/entities/AdminRole";
import DSButton from "@/components/ds/DSButton";
import { useUser } from "@/lib/client/useUser";
import {
  buildDownloadUnpublishedRedirectHref,
  DOWNLOAD_UNPUBLISHED_HISTORY_STORAGE_KEY,
  isLocalHostname,
} from "@/lib/unpublishedDownload";
import { useSyncExternalStore } from "react";

export default function CardsPageActions() {
  const { user, ready } = useUser();
  const isLocal = useSyncExternalStore(
    () => () => undefined,
    () => isLocalHostname(window.location.hostname),
    () => false,
  );
  const canCreateCard = ready && hasRole(user?.adminRoles, AdminRole.SuperAdmin);
  const canDownloadUnpublished = isLocal;

  if (!canCreateCard && !canDownloadUnpublished) {
    return null;
  }

  const handleDownloadUnpublished = () => {
    window.localStorage.removeItem(DOWNLOAD_UNPUBLISHED_HISTORY_STORAGE_KEY);
    window.location.assign(buildDownloadUnpublishedRedirectHref());
  };

  return (
    <>
      {canCreateCard && (
        <DSButton href="/cards/new" label="New Card" variant="primary" />
      )}
      {canDownloadUnpublished && (
        <DSButton
          onClick={handleDownloadUnpublished}
          label="Download Unpublished"
        />
      )}
    </>
  );
}
