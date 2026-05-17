'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ArtIcon, CardsIcon, EventsIcon } from '@/components/ds/DSNavIcons';
import styles from './HeaderNavigation.module.css';

type MenuKey = 'cards' | 'events' | 'art';

const menuItems: Record<MenuKey, {
  label: string;
  icon: typeof CardsIcon;
  activeHrefs: string[];
  options: { href: string; label: string }[];
}> = {
  cards: {
    label: 'Cards',
    icon: CardsIcon,
    activeHrefs: ['/cards', '/collection', '/decks', '/dk'],
    options: [
      { href: '/cards', label: 'Explore Cards' },
      { href: '/collection', label: 'My Collection' },
      { href: '/decks', label: 'My Decks' },
    ],
  },
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

const navItems: MenuKey[] = ['cards', 'events', 'art'];

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
          const menu = menuItems[item];
          const Icon = menu.icon;
          const active = menu.activeHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));
          const open = openMenu === item;

          return (
            <NavigationMenu.Item
              className={styles.item}
              key={item}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') setOpenMenu(item);
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
                onClick={() => setOpenMenu(item)}
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
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
