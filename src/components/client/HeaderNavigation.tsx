'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArtIcon, CardsIcon, EventsIcon, QuestsIcon } from '@/components/ds/DSNavIcons';
import styles from './HeaderNavigation.module.css';

const navItems = [
  { href: '/cards', label: 'Cards', icon: CardsIcon },
  { href: '/events', label: 'Events', icon: EventsIcon },
  { href: '/quests', label: 'Quests', icon: QuestsIcon },
  { href: '/art', label: 'Art', icon: ArtIcon },
];

export default function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <NavigationMenu.Root className={styles.root} aria-label="Primary">
      <NavigationMenu.List className={styles.list}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <NavigationMenu.Item className={styles.item} key={item.href}>
              <NavigationMenu.Link
                active={active}
                aria-label={item.label}
                className={styles.link}
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
