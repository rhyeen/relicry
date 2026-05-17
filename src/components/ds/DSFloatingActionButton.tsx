import Link from 'next/link';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './DSFloatingActionButton.module.css';

type DSFloatingActionButtonProps = Readonly<{
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  className?: string;
  disabled?: boolean;
  href?: string;
  loading?: boolean;
  onClick?: () => void;
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  tooltip?: string;
  type?: 'button' | 'submit' | 'reset';
}> & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'onClick' | 'disabled'>;

const DSFloatingActionButton = forwardRef<HTMLButtonElement, DSFloatingActionButtonProps>(
  function DSFloatingActionButton({
    badge,
    className: classNameProp,
    disabled,
    href,
    icon,
    label,
    loading,
    onClick,
    tone = 'primary',
    tooltip,
    type = 'button',
    ...buttonProps
  }, ref) {
    const className = [
      styles.button,
      styles[`tone${capitalize(tone)}`],
      classNameProp,
    ].filter(Boolean).join(' ');
    const content = (
      <>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        {badge ? <span className={styles.badge}>{badge}</span> : null}
        <span className={styles.tooltip}>{tooltip ?? label}</span>
      </>
    );

    if (href && !disabled && !loading) {
      return (
        <Link
          aria-label={label}
          className={className}
          href={href}
          title={tooltip ?? label}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        {...buttonProps}
        aria-label={label}
        className={className}
        data-disabled={disabled ? '' : undefined}
        data-loading={loading ? 'true' : undefined}
        disabled={disabled || loading}
        onClick={onClick}
        ref={ref}
        title={tooltip ?? label}
        type={type}
      >
        {content}
      </button>
    );
  }
);

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default DSFloatingActionButton;
