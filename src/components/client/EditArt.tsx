"use client";

import { useMemo, useState } from "react";
import { useUser } from '@/lib/client/useUser';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import PermissionDenied from '@/app/permission-denied';
import { Art, getArtId, IllustrationArt, RootArt, WritingArt } from '@/entities/Art';
import { ImageSize } from '@/entities/Image';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useRouter } from 'next/navigation';
import DSButton from '../ds/DSButton';
import DSField, { toDateOnlyString, fromDateOnlyString } from '../ds/DSField';
import DSForm from '../ds/DSForm';
import DSLoadingOverlay from '../ds/DSLoadingOverlay';
import DSSection from '../ds/DSSection';
import DSSwitch from '../ds/DSSwitch';
import DSSelect from '../ds/DSSelect';
import ImageUploader from './ImageUploader/ImageUploader';
import SelectArtist from '@/components/SelectArtist';
import { ImageStorageDraft } from './ImageUploader/ImageUploadDragDrop';

const FormErrors = {
  getArtistError: (art: Art, setSaveError: (error: string | null) => void): string | undefined => {
    if (!art.artistId?.trim()) {
      const error = "Artist is required.";
      setSaveError(error);
      return error;
    }
    return undefined;
  },
  getImageError: (art: Art, setSaveError: (error: string | null) => void): string | undefined => {
    if (art.type !== 'illustration') return undefined;
    let error: string | undefined;
    if (!art.image) {
      error = "Image is required.";
      setSaveError(error);
      return error;
    }
    if (Object.values(art.image).findIndex(img => !img || !(img.path || img.url)) !== -1) {
      error = "All image sizes must be uploaded.";
      setSaveError(error);
      return error;
    }
    return undefined;
  },
};

export function getDefaultNewArt(type: 'illustration' | 'writing'): Art {
  switch (type) {
    case "illustration":
      return getDefaultNewIllustrationArt();
    case "writing":
      return getDefaultNewWritingArt();
    default:
      throw new Error(`Unknown art type: ${type}`);
  }
}

export function getDefaultNewIllustrationArt(): IllustrationArt {
  return {
    ...getDefaultNewRootArt("illustration"),
    type: "illustration",
    image: {
      [ImageSize.Card]: undefined,
      [ImageSize.CardPreview]: undefined,
      [ImageSize.CardFull]: undefined,
    },
  };
}

export function getDefaultNewWritingArt(): WritingArt {
  return {
    ...getDefaultNewRootArt("writing"),
    type: "writing",
    markdown: "",
  };
}

function getDefaultNewRootArt(type: "illustration" | "writing"): RootArt {
  return {
    id: "",
    type,
    artistId: "",
    title: "",
    description: "",
    referenceUrl: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
    aIGenerated: true,
  };
}

type EditArtProps = Readonly<{
  art?: Art;
  type?: "illustration" | "writing";
}>;

export default function EditArt({ art: initArt, type }: EditArtProps) {
  // Keyed remount = reset form when switching cards/types (no effect-based setState)
  const editorKey = useMemo(() => {
    if (initArt?.id) return `${type}:${initArt.id}`;
    return `${type}:new`;
  }, [type, initArt?.id]);
  const { user, ready } = useUser();
  if (!ready) {
    return null;
  }
  if (!hasRole(user?.adminRoles, AdminRole.SuperAdmin)) {
    return PermissionDenied();
  }

  return <EditArtInner key={editorKey} initArt={initArt} type={type} />;
}

function EditArtInner({
  initArt,
  type,
}: {
  initArt?: Art;
  type?: "illustration" | "writing";
}) {
  const typeOptions = useMemo(
    () => ['illustration', 'writing'].map((value) => ({ label: value.toLocaleUpperCase(), value })),
    []
  );

  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [art, setArt] = useState<Art>(() => initArt ?? getDefaultNewArt(type ?? "illustration"));

  const getFinalArt = (): Art => {
    const rootArt: RootArt = {
      ...art,
      artistId: art.artistId.trim(),
      title: art.title?.trim() || undefined,
      description: art.description?.trim() || undefined,
      referenceUrl: art.referenceUrl?.trim() || undefined,
      aIGenerated: art.aIGenerated,
    };
    if (art.type === 'illustration') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (rootArt as any).markdown;
      return {
        ...rootArt,
        type: 'illustration',
        image: (rootArt as IllustrationArt).image,
      } as IllustrationArt;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (rootArt as any).image;
      return {
        ...rootArt,
        type: 'writing',
        markdown: (rootArt as WritingArt).markdown,
      } as WritingArt;
    }
  };

  const onCancel = () => {
    if (art.id) {
      router.push(`/${getArtId(art.id)}`);
    } else {
      router.push('/art');
    }
  };

  const uploadImage = async (
    image: IllustrationArt["image"]
  ): Promise<IllustrationArt["image"]> => {
    const token = await authUser.user?.getIdToken();
    const fd = new FormData();
    const keysUploaded: string[] = [];
    for (const [key, img] of Object.entries(image) as Array<[string, ImageStorageDraft | undefined]>) {
      if (!img) continue;

      let file = img.file;
      // Safety net if the file wasn’t provided, rebuild it from preview url/path
      if (!file) {
        const src = img.url || img.path;
        if (!src) continue;

        const resp = await fetch(src);
        if (!resp.ok) {
          throw new Error(`Failed to read image bytes for "${key}" (${resp.status})`);
        }
        const blob = await resp.blob();
        file = new File([blob], `${key}.webp`, { type: blob.type || "image/webp" });
      }
      fd.append(key, file, file.name);
      keysUploaded.push(key);
    }

    fd.append("keys", JSON.stringify(keysUploaded));
    const res = await fetch("/api/images/upload", {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: fd,
    });
    for (const [key, img] of Object.entries(image) as Array<[string, ImageStorageDraft | undefined]>) {
      if (!img) continue;
      if (keysUploaded.includes(key)) {
        // Revoke preview URLs immediately after upload to free memory, since they won't be used anymore
        if (img.url) {
          URL.revokeObjectURL(img.url);
        }
      }
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaveError(json?.error || json?.details || `Image upload failed (${res.status})`);
      throw new Error(json?.error || `Image upload failed (${res.status})`);
    }

    return json.image as IllustrationArt["image"];
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = (
      !!FormErrors.getArtistError(art, setSaveError) ||
      !!FormErrors.getImageError(art, setSaveError)
    );

    if (hasErrors) {
      return;
    }

    const copiedArt = getFinalArt();
    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const imageNeedsUpload = copiedArt.image && Object.values(copiedArt.image).find(img => !img.path);
      if (imageNeedsUpload) {
        const imageUpdates = await uploadImage(copiedArt.image!);
        copiedArt.image = imageUpdates;
      }
      const res = await fetch('/api/admin/art', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ art: copiedArt }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const { id } = json.art as { id: string };
      router.push(`/${getArtId(id)}`);
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
        <DSForm.Title>Edit Art</DSForm.Title>
        <DSForm.Description>
          Edit or create an art piece—either writing or illustration.
        </DSForm.Description>
    
        <DSField
          label="Art ID"
          value={art.id}
          onChange={(value) => setArt(a => ({ ...a, id: value }))}
          placeholder="Will be generated if new art"
          readonly
        />

        <DSField
          label="Title"
          value={art.title || ''}
          onChange={(value) => setArt(a => ({ ...a, title: value }))}
        />

        <DSField
          label="Description"
          value={art.description || ''}
          onChange={(value) => setArt(a => ({ ...a, description: value }))}
        />

        <DSField
          label="Reference URL"
          value={art.referenceUrl || ''}
          onChange={(value) => setArt(a => ({ ...a, referenceUrl: value }))}
        />

        <SelectArtist
          selectedArtistId={art.artistId}
          onSelect={(artist) => {
            setArt((a) => ({ ...a, artistId: artist.id }));
            setSaveError(null);
          }}
        />

        <DSSelect
          label="Art Type"
          options={typeOptions}
          value={art.type}
          onChange={(type) => setArt((a) => ({
            ...getDefaultNewArt(type as 'illustration' | 'writing'),
            ...a,
            type,
          }) as IllustrationArt | WritingArt)}
          required
        />

        { art.type === 'writing' &&
          <DSField
            label="Content"
            value={(art as WritingArt).markdown}
            onChange={(value) => setArt(a => ({ ...a, markdown: value }))}
            description="Write content in Markdown format."
            required
            multiline
          />
        }

        { art.type === 'illustration' &&
          <ImageUploader
            label="Illustration Image"
            description="Upload the illustration image for this art piece in different resolutions for card art."
            images={(art as IllustrationArt).image}
            onChange={(images) => setArt(a => ({ ...a, image: images }) as IllustrationArt)}
            required
            type="illustration"
          />
        }

        <DSSwitch
          label="AI Generated?"
          checked={art.aIGenerated}
          onChange={(value) => setArt(a => ({ ...a, aIGenerated: value }))}
        />

        <DSSwitch
          label="Archived?"
          checked={art.archivedAt !== null}
          onChange={(value) => setArt(a => ({ ...a, archivedAt: value ? new Date() : null }))}
        />
  
        {art.archivedAt && (
          <>
            <DSField
              label="Archived At"
              type="date"
              value={toDateOnlyString(art.archivedAt)}
              onChange={(value) => setArt(a => ({ ...a, archivedAt: fromDateOnlyString(value) || new Date() }))}
            />
          </>
        )}

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save" loading={loading} disabled={!authUser.ready} />
          <DSButton onClick={onCancel} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
