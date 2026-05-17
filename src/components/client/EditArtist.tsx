"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PermissionDenied from '@/app/permission-denied';
import DSButton from '@/components/ds/DSButton';
import DSField, { fromDateOnlyString, toDateOnlyString } from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import DSSelect from '@/components/ds/DSSelect';
import DSSwitch from '@/components/ds/DSSwitch';
import ImageUploader from '@/components/client/ImageUploader/ImageUploader';
import { ImageStorageDraft } from '@/components/client/ImageUploader/ImageUploadDragDrop';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { Artist, getArtistId } from '@/entities/Artist';
import { ImageSize } from '@/entities/Image';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import { useRouter } from 'next/navigation';

type ArtistBannerImage = {
  [ImageSize.Banner]?: ImageStorageDraft;
};

type EditableArtist = Artist & {
  bannerImage?: ArtistBannerImage;
};

type ArtistEditorOptions = {
  users: Array<{
    label: string;
    value: string;
  }>;
};

const FormErrors = {
  getNameError: (name: string): string | undefined => {
    if (!name.trim()) {
      return "Name is required.";
    }
    return undefined;
  },
};

export function getDefaultNewArtist(): EditableArtist {
  return {
    id: "",
    userId: "",
    name: "",
    profileImageUrl: "",
    bannerImageUrl: "",
    bannerImage: {},
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
  const [artist, setArtist] = useState<EditableArtist>(() => normalizeArtist(initArtist ?? getDefaultNewArtist()));
  const [options, setOptions] = useState<ArtistEditorOptions | null>(null);

  const loadOptions = useCallback(async () => {
    if (!authUser.ready || !authUser.user) return;
    setLoading(true);
    setSaveError(null);
    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch('/api/admin/artists?options=1', {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Load failed (${res.status})`);
      }
      setOptions(json.options as ArtistEditorOptions);
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? "Failed to load artist options.");
    } finally {
      setLoading(false);
    }
  }, [authUser.ready, authUser.user]);

  useEffect(() => {
    if (options || !authUser.ready || !authUser.user) return;
    void loadOptions();
  }, [authUser.ready, authUser.user, loadOptions, options]);

  const uploadBannerImage = async (image: ArtistBannerImage | undefined): Promise<Artist['bannerImage'] | undefined> => {
    if (!authUser.user || !image) return image;
    const token = await authUser.user.getIdToken();
    const form = new FormData();
    const keysUploaded: string[] = [];

    for (const [key, img] of Object.entries(image) as Array<[string, ImageStorageDraft | undefined]>) {
      if (!img || img.path) continue;
      let file = img.file;
      if (!file && img.url) {
        const response = await fetch(img.url);
        const blob = await response.blob();
        file = new File([blob], `${key}.webp`, { type: blob.type || 'image/webp' });
      }
      if (!file) continue;
      form.append(key, file, file.name);
      keysUploaded.push(key);
    }

    if (keysUploaded.length === 0) {
      return image as Artist['bannerImage'];
    }

    form.append('keys', JSON.stringify(keysUploaded));
    const res = await fetch('/api/images/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `Artist banner upload failed (${res.status})`);
    }

    for (const [key, img] of Object.entries(image) as Array<[string, ImageStorageDraft | undefined]>) {
      if (img?.url && keysUploaded.includes(key)) {
        URL.revokeObjectURL(img.url);
      }
    }

    return {
      ...image,
      ...json.image,
    } as Artist['bannerImage'];
  };

  const getFinalArtist = async (): Promise<Artist> => {
    const bannerImage = await uploadBannerImage(artist.bannerImage);

    return {
      ...artist,
      userId: artist.userId || '',
      name: artist.name.trim(),
      profileImageUrl: artist.profileImageUrl?.trim() || undefined,
      bannerImageUrl: artist.bannerImageUrl?.trim() || undefined,
      bannerImage,
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

    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const copiedArtist = await getFinalArtist();
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
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    if (artist.id) {
      router.push(`/${artist.id}`);
      return;
    }
    router.push('/artists');
  };

  if (!options) {
    return (
      <DSSection.Card background="darkBrown" width="form">
        <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
        Loading artist options...
      </DSSection.Card>
    );
  }
  
  return (
    <DSSection.Card background="darkBrown" width="form">
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm width="full">
        <DSForm.Title>{artist.id ? 'Edit Artist' : 'New Artist'}</DSForm.Title>
        <DSForm.Description>
          Create an archive artist, optionally link them to a Relicry user, and manage the banner used on artist pages.
        </DSForm.Description>

        <DSField
          label="Artist ID"
          value={artist.id}
          onChange={(value) => setArtist(a => ({ ...a, id: value }))}
          placeholder="Will be generated for new artists"
          readonly
        />

        <DSSelect
          label="Associated User"
          value={artist.userId || ''}
          options={[{ label: 'No user association', value: '' }, ...options.users]}
          onChange={(value) => setArtist((current) => ({ ...current, userId: value }))}
          description="When set, the artist profile image is pulled from the user account with DSAvatar."
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
          multiline
          rows={4}
        />

        <ImageUploader
          label="Banner Image"
          description="Upload and crop a 1920×480 artist banner."
          images={artist.bannerImage ?? {}}
          onChange={(images) => setArtist((current) => ({ ...current, bannerImage: images as ArtistBannerImage }))}
          type="banner"
        />

        <DSField
          label="Legacy Profile Image URL"
          type="url"
          value={artist.profileImageUrl || ''}
          onChange={(value) => setArtist(a => ({ ...a, profileImageUrl: value }))}
          description="Used only when the artist is not associated with a user."
        />

        <DSField
          label="Legacy Banner Image URL"
          type="url"
          value={artist.bannerImageUrl || ''}
          onChange={(value) => setArtist(a => ({ ...a, bannerImageUrl: value }))}
          description="Used when no uploaded banner image is saved."
        />

        <DSSwitch
          label="Archived?"
          checked={artist.archivedAt !== null}
          onChange={(value) => setArtist(a => ({ ...a, archivedAt: value ? new Date() : null }))}
        />
  
        {artist.archivedAt && (
          <DSField
            label="Archived At"
            type="date"
            value={toDateOnlyString(artist.archivedAt)}
            onChange={(value) => setArtist(a => ({ ...a, archivedAt: fromDateOnlyString(value) || new Date() }))}
          />
        )}

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save Artist" loading={loading} disabled={!authUser.ready} />
          <DSButton onClick={onCancel} label="Cancel" loading={loading} variant="ghost" />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection.Card>
  );
}

function normalizeArtist(artist: Artist | EditableArtist): EditableArtist {
  return {
    ...artist,
    bannerImage: artist.bannerImage ?? {},
    createdAt: coerceDate(artist.createdAt) ?? new Date(),
    updatedAt: coerceDate(artist.updatedAt) ?? new Date(),
    archivedAt: artist.archivedAt ? coerceDate(artist.archivedAt) : null,
  };
}

function coerceDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
