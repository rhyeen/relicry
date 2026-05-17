'use client';

import { Menu } from '@base-ui/react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <NavigationMenu.Root
      className={styles.root}
      aria-label="Primary"
    >
      <NavigationMenu.List className={styles.list}>
        {navItems.map((item) => {
          const menu = menuItems[item];
          const Icon = menu.icon;
          const active = menu.activeHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`));

          return (
            <Menu.Root key={item} modal={false}>
              <NavigationMenu.Item className={styles.item}>
                <Menu.Trigger
                  aria-label={`${menu.label} menu`}
                  className={styles.link}
                  closeDelay={80}
                  data-active={active ? '' : undefined}
                  delay={50}
                  openOnHover
                  type="button"
                >
                  <Icon className={styles.icon} />
                </Menu.Trigger>
                <Menu.Portal>
                  <Menu.Positioner
                    align="center"
                    className={styles.positioner}
                    collisionAvoidance={{ side: 'flip', align: 'shift', fallbackAxisSide: 'none' }}
                    collisionPadding={8}
                    side="bottom"
                    sideOffset={7}
                  >
                    <Menu.Popup className={styles.menu} aria-label={`${menu.label} menu`}>
                      {menu.options.map((option) => (
                        <Menu.Item
                          className={styles.menuLink}
                          closeOnClick
                          key={option.href}
                          render={<Link href={option.href} />}
                        >
                          {option.label}
                        </Menu.Item>
                      ))}
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </NavigationMenu.Item>
            </Menu.Root>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
