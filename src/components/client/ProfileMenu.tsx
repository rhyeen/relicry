'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSSpinner from '@/components/ds/DSSpinner';
import { AdminIcon, LocalIcon, SignOutIcon, UserIcon } from '@/components/ds/DSNavIcons';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { buildUniversalScanQrImageSrc } from '@/lib/scanQr';
import { useUser } from '@/lib/client/useUser';
import { signOutUser } from '@/lib/client/signInClient';
import useIsEmulated from '@/lib/client/useIsEmulated';
import styles from './ProfileMenu.module.css';

type ProfileMenuProps = Readonly<{
  displayName?: string | null;
  photoURL?: string | null;
}>;

export default function ProfileMenu({ displayName, photoURL }: ProfileMenuProps) {
  const router = useRouter();
  const { user, ready } = useUser();
  const isEmulated = useIsEmulated();
  const [open, setOpen] = useState(false);
  const label = displayName ? `${displayName} profile menu` : 'Profile menu';
  const initials = getInitials(displayName);
  const canUseAdminControls = ready && hasRole(user?.adminRoles, AdminRole.SuperAdmin);
  const canUseLocalControls = isEmulated === true;

  const handleSignOut = async () => {
    try {
      await signOutUser();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <>
      <button
        className={styles.trigger}
        aria-label={label}
        type="button"
        onClick={() => setOpen(true)}
      >
        {photoURL ? (
          <Image
            className={styles.avatar}
            src={photoURL}
            alt=""
            width={40}
            height={40}
          />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {initials}
          </span>
        )}
        <span className={styles.tooltip}>Profile</span>
      </button>

      <DSDialog
        open={open}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
        title="Your QR Code"
        description="Show this QR code only to authorized event staff when asked to scan your Relicry profile. Do not share it with anyone else. Anyone with your QR code may be able to redeem your card rewards. If you think your QR code has been compromised, contact us to reset it."
        content={
          <div className={styles.dialogContent}>
            {!ready && (
              <div className={styles.qrLoading}>
                <DSSpinner label="Loading player QR" />
              </div>
            )}
            {ready && user && (
              <div className={styles.qrFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className={styles.qr}
                  src={buildUniversalScanQrImageSrc(user.id)}
                  alt="Relicry player scan QR code"
                  width={280}
                  height={280}
                />
                <span className={styles.userId}>{user.id}</span>
              </div>
            )}
            {ready && !user && (
              <p className={styles.dialogCopy}>Unable to load your Relicry profile. Try refreshing the page.</p>
            )}
            <div className={styles.dialogActions}>
              <DSButton
                href="/profile"
                icon={<UserIcon />}
                label="View profile"
                onClick={() => setOpen(false)}
                variant="primary"
              />
              {canUseAdminControls && (
                <DSButton
                  href="/admin"
                  icon={<AdminIcon />}
                  label="Admin controls"
                  onClick={() => setOpen(false)}
                />
              )}
              {canUseLocalControls && (
                <DSButton
                  href="/local"
                  icon={<LocalIcon />}
                  label="Local controls"
                  onClick={() => setOpen(false)}
                />
              )}
              <DSButton
                icon={<SignOutIcon />}
                label="Sign out"
                onClick={handleSignOut}
                variant="ghost"
              />
            </div>
          </div>
        }
      />
    </>
  );
}

function getInitials(displayName?: string | null) {
  if (!displayName) return 'R';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'R';
}
