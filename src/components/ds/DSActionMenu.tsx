'use client';

import { Menu } from '@base-ui/react';
import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import styles from './DSActionMenu.module.css';

export type DSActionMenuItem = Readonly<{
  label: string;
  description?: string;
  destructive?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: ReactNode;
  onClick?: () => void;
}>;

type DSActionMenuProps = Readonly<{
  ariaLabel?: string;
  children?: ReactNode;
  items: DSActionMenuItem[];
  trigger: ReactElement;
}>;

export default function DSActionMenu({ ariaLabel, children, items, trigger }: DSActionMenuProps) {
  return (
    <Menu.Root modal={false}>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner side="top" align="end" sideOffset={12} className={styles.positioner}>
          <Menu.Popup className={styles.popup} aria-label={ariaLabel}>
            {children ? <div className={styles.customContent}>{children}</div> : null}
            {children && items.length > 0 ? <Menu.Separator className={styles.separator} /> : null}
            {items.map((item) => (
              <ActionMenuItem item={item} key={item.label} />
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function ActionMenuItem({ item }: Readonly<{ item: DSActionMenuItem }>) {
  const content = (
    <>
      {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : null}
      <span className={styles.itemText}>
        <span className={styles.itemLabel}>{item.label}</span>
        {item.description ? <span className={styles.itemDescription}>{item.description}</span> : null}
      </span>
    </>
  );

  if (item.href && !item.disabled) {
    return (
      <Menu.Item
        className={styles.item}
        closeOnClick
        data-destructive={item.destructive ? 'true' : undefined}
        render={<Link href={item.href} />}
      >
        {content}
      </Menu.Item>
    );
  }

  return (
    <Menu.Item
      className={styles.item}
      closeOnClick
      data-destructive={item.destructive ? 'true' : undefined}
      disabled={item.disabled}
      onClick={item.onClick}
    >
      {content}
    </Menu.Item>
  );
}
