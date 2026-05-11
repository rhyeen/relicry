'use client';

import { useCallback, useEffect, useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import ImageUploader from '@/components/client/ImageUploader/ImageUploader';
import { ImageStorageDraft } from '@/components/client/ImageUploader/ImageUploadDragDrop';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { ImageSize, ImageStorage } from '@/entities/Image';
import { getStarterDeckHeading } from '@/lib/starterDecks';
import { useAuthUser } from '@/lib/client/useAuthUser';
import styles from './page.module.css';

type ProfileImage = {
  [ImageSize.Banner]?: ImageStorageDraft;
  [ImageSize.Thumb]?: ImageStorageDraft;
};

type StarterDeckView = {
  id: string;
  title: string;
  obtainedAt: string;
  obtainedBy: string;
  atEventId: string;
};

type ProfileData = {
  user: {
    id: string;
    displayName: string;
    email: string;
    adminRoles: AdminRole[];
    profileImage?: ProfileImage;
  };
  starterDecksObtained: StarterDeckView[];
  activeEvent: {
    id: string;
    title: string;
    checkedInAt: string;
  } | null;
  activeEventCurrent: boolean;
};

export default function ProfileClient() {
  const auth = useAuthUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState<ProfileImage>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const applyProfile = useCallback((data: ProfileData) => {
    setProfile(data);
    setDisplayName(data.user.displayName ?? '');
    setEmail(data.user.email ?? '');
    setProfileImage(data.user.profileImage ?? {});
  }, []);

  const loadProfile = useCallback(async () => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Unable to load profile (${res.status})`);
      }
      applyProfile(json);
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, [applyProfile, auth.user]);

  useEffect(() => {
    if (auth.ready && auth.user) {
      loadProfile();
    }
  }, [auth.ready, auth.user, loadProfile]);

  const uploadProfileImage = async (image: ProfileImage): Promise<{ [key: string]: ImageStorage | undefined }> => {
    if (!auth.user) return image;
    const token = await auth.user.getIdToken();
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
      return image;
    }

    form.append('keys', JSON.stringify(keysUploaded));
    const res = await fetch('/api/profile/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(json?.error || `Profile image upload failed (${res.status})`);
    }

    for (const [key, img] of Object.entries(image) as Array<[string, ImageStorageDraft | undefined]>) {
      if (img?.url && keysUploaded.includes(key)) {
        URL.revokeObjectURL(img.url);
      }
    }

    return {
      ...image,
      ...json.image,
    };
  };

  const saveProfile = async () => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const token = await auth.user.getIdToken();
      const savedProfileImage = await uploadProfileImage(profileImage);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName,
          email,
          profileImage: savedProfileImage,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Unable to save profile (${res.status})`);
      }
      applyProfile(json);
      setSaved(true);
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    if (!auth.user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await auth.user.getIdToken();
      const res = await fetch('/api/admin/active-event', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || `Unable to check out (${res.status})`);
      }
      await loadProfile();
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to check out.');
    } finally {
      setLoading(false);
    }
  };

  if (!auth.ready) {
    return <Shell><DSSpinner label="Loading account" /></Shell>;
  }

  if (!auth.user) {
    return (
      <Shell>
        <DSText.Heading as="h1" size="display" className={styles.title}>Your Relicry profile</DSText.Heading>
        <DSText.Body className={styles.copy}>Sign in to manage your profile and starter deck record.</DSText.Body>
        <DSButton href="/login?next=/profile" label="Sign In" variant="primary" />
      </Shell>
    );
  }

  return (
    <Shell>
      <DSLoadingOverlay loading={loading} error={error} dismissError={setError} />
      {!profile ? (
        <DSSpinner label="Loading profile" />
      ) : (
        <div className={styles.content}>
          <DSForm>
            <DSForm.Title>Your Relicry profile</DSForm.Title>
            <DSForm.Description>
              Update the details Relicry uses for event check-ins, quests, and collection records.
            </DSForm.Description>
            <DSField label="Display Name" value={displayName} onChange={setDisplayName} />
            <DSField label="Email" type="email" value={email} onChange={setEmail} />
            <ImageUploader
              label="Profile Image"
              description="Upload a banner and square thumbnail for your Relicry profile."
              images={profileImage}
              onChange={(images) => setProfileImage(images as ProfileImage)}
              type="profile"
            />
            <DSForm.ButtonGroup>
              <DSButton onClick={saveProfile} label="Save Profile" variant="primary" loading={loading} />
              {saved && <span className={styles.saved}>Saved</span>}
            </DSForm.ButtonGroup>
          </DSForm>

          <section className={styles.subpanel} aria-labelledby="starter-decks-title">
            <DSText.Heading as="h2" size="xl" className={styles.title} id="starter-decks-title">
              {getStarterDeckHeading(profile.starterDecksObtained.length)}
            </DSText.Heading>
            {profile.starterDecksObtained.length === 0 ? (
              <DSText.Body className={styles.copy}>No starter deck has been recorded yet.</DSText.Body>
            ) : (
              <div className={styles.starterList}>
                {profile.starterDecksObtained.map((starter) => (
                  <div className={styles.starter} key={`${starter.id}-${starter.obtainedAt}`}>
                    <span>{starter.title}</span>
                    <small>{formatDate(starter.obtainedAt)} at {starter.atEventId}</small>
                  </div>
                ))}
              </div>
            )}
          </section>

          {hasRole(profile.user.adminRoles, AdminRole.EventAdmin) && (
            <section className={styles.subpanel} aria-labelledby="active-event-title">
              <DSText.Heading as="h2" size="xl" className={styles.title} id="active-event-title">
                Event admin check-in
              </DSText.Heading>
              {profile.activeEvent ? (
                <>
                  <DSText.Body className={styles.copy}>
                    Checked into {profile.activeEvent.title}
                    {profile.activeEventCurrent ? '' : ' (expired)'}.
                  </DSText.Body>
                  <DSButton onClick={checkout} label="Check Out" variant="ghost" loading={loading} />
                </>
              ) : (
                <DSText.Body className={styles.copy}>
                  You are not checked into an event.
                </DSText.Body>
              )}
            </section>
          )}
        </div>
      )}
    </Shell>
  );
}

function Shell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        {children}
      </section>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}
