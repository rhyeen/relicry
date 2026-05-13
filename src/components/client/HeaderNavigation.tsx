'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArtIcon, CardsIcon, EventsIcon } from '@/components/ds/DSNavIcons';
import styles from './HeaderNavigation.module.css';

type MenuKey = 'events' | 'art';

const linkItems = [
  { href: '/cards', label: 'Cards', icon: CardsIcon },
];

const menuItems: Record<MenuKey, {
  label: string;
  icon: typeof EventsIcon;
  activeHrefs: string[];
  options: { href: string; label: string }[];
}> = {
  events: {
    label: 'Events',
    icon: EventsIcon,
    activeHrefs: ['/events', '/quests'],
    options: [
      { href: '/events', label: 'Find an Event' },
      { href: '/quests', label: 'Go on a Quest' },
    ],
  },
  art: {
    label: 'Art',
    icon: ArtIcon,
    activeHrefs: ['/art', '/lore'],
    options: [
      { href: '/art', label: 'View Card Art' },
      { href: '/lore', label: 'Discover the Lore' },
    ],
  },
};

const navItems: ({ type: 'link' } & (typeof linkItems)[number] | { type: 'menu'; key: MenuKey })[] = [
  ...linkItems.map((item) => ({ ...item, type: 'link' as const })),
  { type: 'menu', key: 'events' },
  { type: 'menu', key: 'art' },
];

export default function HeaderNavigation() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setOpenMenu(null);
    }
  };

  return (
    <NavigationMenu.Root
      className={styles.root}
      aria-label="Primary"
      ref={rootRef}
      onKeyDown={handleKeyDown}
    >
      <NavigationMenu.List className={styles.list}>
        {navItems.map((item) => {
          if (item.type === 'menu') {
            const menu = menuItems[item.key];
            const Icon = menu.icon;
            const active = menu.activeHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
            const open = openMenu === item.key;

            return (
              <NavigationMenu.Item
                className={styles.item}
                key={item.key}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') setOpenMenu(item.key);
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse') setOpenMenu(null);
                }}
              >
                <button
                  aria-expanded={open}
                  aria-haspopup="menu"
                  aria-label={`${menu.label} menu`}
                  className={styles.link}
                  data-active={active ? '' : undefined}
                  onClick={() => setOpenMenu(item.key)}
                  type="button"
                >
                  <Icon className={styles.icon} />
                </button>
                {open && (
                  <div className={styles.menu} role="menu">
                    {menu.options.map((option) => (
                      <Link
                        className={styles.menuLink}
                        href={option.href}
                        key={option.href}
                        onClick={() => setOpenMenu(null)}
                        role="menuitem"
                      >
                        {option.label}
                      </Link>
                    ))}
                  </div>
                )}
              </NavigationMenu.Item>
            );
          }

          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavigationMenu.Item className={styles.item} key={item.href}>
              <NavigationMenu.Link
                active={active}
                aria-label={item.label}
                className={styles.link}
                onClick={() => setOpenMenu(null)}
                render={<Link href={item.href} />}
              >
                <Icon className={styles.icon} />
                <span className={styles.tooltip}>{item.label}</span>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
