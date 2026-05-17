'use client';

import { Avatar } from '@base-ui/react/avatar';
import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { ImageSize, type ImageStorage } from '@/entities/Image';
import type { User } from '@/entities/User';
import { resolveUrlFromPath } from '@/components/client/StoredImage';
import styles from './DSAvatar.module.css';

export type DSAvatarUser = Pick<User, 'displayName' | 'profileImage'>;

type DSAvatarSize = 'sm' | 'md' | 'lg' | 'xl' | 'preview' | 'fill' | number;

type DSAvatarProps = Readonly<{
  user?: DSAvatarUser | null;
  size?: DSAvatarSize;
  className?: string;
  decorative?: boolean;
  label?: string;
  variant?: 'framed' | 'plain';
}>;

export function getUserAvatarFallback(user?: Pick<User, 'displayName'> | null) {
  const displayName = user?.displayName?.trim();
  if (!displayName) return '?';

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => Array.from(part)[0]?.toUpperCase())
    .join('');

  return initials || '?';
}

export function getUserAvatarImage(user?: Pick<User, 'profileImage'> | null): ImageStorage | undefined {
  return user?.profileImage?.[ImageSize.Thumb] ?? user?.profileImage?.[ImageSize.Banner];
}

export default function DSAvatar({
  className,
  decorative = false,
  label,
  size = 'md',
  user,
  variant = 'framed',
}: DSAvatarProps) {
  const image = getUserAvatarImage(user);
  const fallback = getUserAvatarFallback(user);
  const src = useResolvedAvatarSrc(image);
  const rootStyle = typeof size === 'number'
    ? ({ '--ds-avatar-size': `${size}px` } as CSSProperties)
    : undefined;

  return (
    <Avatar.Root
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label ?? avatarLabel(user)}
      className={[
        styles.root,
        styles[`size${capitalize(typeof size === 'number' ? 'custom' : size)}`],
        styles[`variant${capitalize(variant)}`],
        className,
      ].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      {src && <Avatar.Image alt="" className={styles.image} src={src} />}
      <Avatar.Fallback className={styles.fallback} delay={src ? 300 : 0}>
        {fallback}
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

function useResolvedAvatarSrc(image?: ImageStorage) {
  const [resolvedPath, setResolvedPath] = useState<{ path: string; src: string } | null>(null);
  const path = image?.path;
  const immediateSrc = image?.url ?? null;
  const resolvedSrc = path && resolvedPath?.path === path ? resolvedPath.src : null;

  useEffect(() => {
    let alive = true;

    if (!path || immediateSrc) return;

    resolveUrlFromPath(path)
      .then((url) => {
        if (alive) setResolvedPath({ path, src: url });
      })
      .catch(() => {
        if (alive) setResolvedPath(null);
      });

    return () => {
      alive = false;
    };
  }, [immediateSrc, path]);

  return immediateSrc ?? resolvedSrc;
}

function avatarLabel(user?: DSAvatarUser | null) {
  const displayName = user?.displayName?.trim();
  return displayName ? `${displayName} profile image` : 'Profile image';
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
