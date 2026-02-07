"use client";

import { useMemo, useState } from "react";
import { useUser } from '@/lib/client/useUser';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import PermissionDenied from '@/app/permission-denied';
import { Artist, getArtistId } from '@/entities/Artist';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useRouter } from 'next/navigation';
import DSSection from '@/components/ds/DSSection';
import DSForm from '@/components/ds/DSForm';
import DSField, { toDateOnlyString } from '@/components/ds/DSField';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSwitch from '@/components/ds/DSSwitch';
import { fromDateOnlyString } from '@/components/ds/DSField';
import DSButton from '@/components/ds/DSButton';

const FormErrors = {
  getNameError: (name: string): string | undefined => {
    if (!name.trim()) {
      return "Name is required.";
    }
    return undefined;
  },
};

export function getDefaultNewArtist(): Artist {
  return {
    id: "",
    userId: "",
    name: "",
    profileImageUrl: "",
    bannerImageUrl: "",
    summary: "",
    promotedArtIds: [],
    promotedItemIds: [],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

type EditArtistProps = Readonly<{
  artist?: Artist;
}>;

export default function EditArtist({ artist: initArtist }: EditArtistProps) {
  // Keyed remount = reset form when switching cards/types (no effect-based setState)
  const editorKey = useMemo(() => {
    if (initArtist?.id) return `${initArtist.id}`;
    return `new`;
  }, [initArtist?.id]);
  const { user, ready } = useUser();
  if (!ready) {
    return null;
  }
  if (!hasRole(user?.adminRoles, AdminRole.SuperAdmin)) {
    return PermissionDenied();
  }

  return <EditArtistInner key={editorKey} initArtist={initArtist} />;
}

function EditArtistInner({
  initArtist,
}: {
  initArtist?: Artist;
}) {
  const authUser = useAuthUser();
  const router = useRouter();
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [artist, setArtist] = useState<Artist>(() => initArtist ?? getDefaultNewArtist());

  const getFinalArtist = (): Artist => {
    return {
      ...artist,
      name: artist.name.trim(),
      profileImageUrl: artist.profileImageUrl || undefined,
      bannerImageUrl: artist.bannerImageUrl || undefined,
      summary: artist.summary?.trim() || undefined,
    };
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = (
      !!FormErrors.getNameError(artist.name)
    );

    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }

    const copiedArtist = getFinalArtist();
    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch('/api/admin/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ artist: copiedArtist }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const { id } = json.artist as { id: string };
      router.push(`/${getArtistId(id)}`);
      // @NOTE: ensures fresh data if the destination is cached
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? "Failed to save.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm>
        <DSForm.Title>Edit Artist</DSForm.Title>
        <DSForm.Description>
          Edit or create an artist to associate illustrations and writings with.
        </DSForm.Description>

        <DSField
          label="Artist ID"
          value={artist.id}
          onChange={(value) => setArtist(a => ({ ...a, id: value }))}
          placeholder="Will be generated if new artist"
          readonly
        />

        <DSField
          label="Name"
          value={artist.name}
          onChange={(value) => setArtist(a => ({ ...a, name: value }))}
          required
          error={saveAttempted ? FormErrors.getNameError(artist.name) : undefined}
        />

        <DSField
          label="Summary"
          value={artist.summary || ''}
          onChange={(value) => setArtist(a => ({ ...a, summary: value }))}
        />

        <DSSwitch
          label="Archived?"
          checked={artist.archivedAt !== null}
          onChange={(value) => setArtist(a => ({ ...a, archivedAt: value ? new Date() : null }))}
        />
  
        {artist.archivedAt && (
          <>
            <DSField
              label="Archived At"
              type="date"
              value={toDateOnlyString(artist.archivedAt)}
              onChange={(value) => setArtist(a => ({ ...a, archivedAt: fromDateOnlyString(value) || new Date() }))}
  
            />
          </>
        )}

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" loading={loading} disabled={!authUser.ready} />
          <DSButton onClick={onSave} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
