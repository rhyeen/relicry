'use client';

import { Menu } from '@base-ui/react/menu';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignOutIcon, UserIcon } from '@/components/ds/DSNavIcons';
import { signOutUser } from '@/lib/client/signInClient';
import styles from './ProfileMenu.module.css';

type ProfileMenuProps = Readonly<{
  displayName?: string | null;
  photoURL?: string | null;
}>;

export default function ProfileMenu({ displayName, photoURL }: ProfileMenuProps) {
  const router = useRouter();
  const label = displayName ? `${displayName} profile menu` : 'Profile menu';
  const initials = getInitials(displayName);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.refresh();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger className={styles.trigger} aria-label={label}>
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
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={10}>
          <Menu.Popup className={styles.popup}>
            <div className={styles.identity}>
              <span className={styles.identityName}>{displayName || 'Player'}</span>
              <span className={styles.identityMeta}>Relicry profile</span>
            </div>
            <Menu.Item
              className={styles.item}
              label="View profile"
              render={<Link href="/profile" />}
            >
              <UserIcon className={styles.itemIcon} />
              <span>View profile</span>
            </Menu.Item>
            <Menu.Separator className={styles.separator} />
            <Menu.Item className={styles.item} label="Sign out" onClick={handleSignOut}>
              <SignOutIcon className={styles.itemIcon} />
              <span>Sign out</span>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
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
