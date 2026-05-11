import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './DSIconButton.module.css';

type DSIconButtonProps = Readonly<{
  label: string;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  title?: string;
  tooltipPlacement?: 'top' | 'bottom';
  type?: 'button' | 'submit' | 'reset';
  size?: 'sm' | 'md';
  variant?: 'ghost' | 'gold';
}>;

export default function DSIconButton({
  children,
  href,
  label,
  onClick,
  size = 'md',
  title,
  tooltipPlacement = 'bottom',
  type = 'button',
  variant = 'ghost',
}: DSIconButtonProps) {
  const className = [
    styles.button,
    styles[`size${capitalize(size)}`],
    styles[`variant${capitalize(variant)}`],
  ].join(' ');
  const tooltip = title ?? label;

  const content = (
    <>
      <span className={styles.icon} aria-hidden="true">{children}</span>
      <span className={styles.tooltip}>{tooltip}</span>
    </>
  );

  if (href) {
    return (
      <Link
        className={className}
        href={href}
        aria-label={label}
        title={tooltip}
        onClick={onClick}
        data-tooltip-placement={tooltipPlacement}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={className}
      type={type}
      aria-label={label}
      title={tooltip}
      onClick={onClick}
      data-tooltip-placement={tooltipPlacement}
    >
      {content}
    </button>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
