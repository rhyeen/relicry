import { Button } from '@base-ui/react';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import styles from "./DSButton.module.css";

type ButtonIcon = 'checked' | ReactNode;

type DSButtonRootProps = Readonly<{
  label: string;
  className?: string;
  icon?: ButtonIcon;
  onClick?: () => void;
  dialogTrigger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  size?: 'md' | 'lg';
}>;

function DSButtonRoot({
  className: classNameProp,
  href,
  icon,
  label,
  onClick,
  rel,
  target,
  dialogTrigger,
  disabled,
  loading,
  type = 'button',
  variant = 'secondary',
  size = 'md',
}: DSButtonRootProps) {
  const isLink = !!href;
  const isNative = !dialogTrigger && !isLink;
  const className = [
    styles.button,
    styles[`variant${capitalize(variant)}`],
    styles[`size${capitalize(size)}`],
    classNameProp,
  ].filter(Boolean).join(' ');
  const content = (
    <>
      {icon && <span className={styles.icon} aria-hidden="true">{renderIcon(icon)}</span>}
      <span>{label}</span>
    </>
  );

  if (isLink) {
    const isDisabled = disabled || loading;

    if (!isDisabled) {
      return (
        <Link
          className={className}
          href={href}
          data-loading={loading ? 'true' : undefined}
          onClick={onClick}
          rel={rel}
          target={target}
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        className={className}
        aria-disabled="true"
        data-disabled=""
        data-loading={loading ? 'true' : undefined}
        onClick={(event) => event.preventDefault()}
        rel={rel}
        tabIndex={-1}
        target={target}
      >
        {content}
      </a>
    );
  }

  if (isNative) {
    return (
      <button
        className={className}
        onClick={onClick}
        type={type}
        disabled={disabled || loading}
        data-loading={loading ? 'true' : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <Button
      className={className}
      onClick={onClick}
      nativeButton={false}
      render={<div />}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
    >
      {content}
    </Button>
  );
}

function renderIcon(icon: ButtonIcon) {
  if (icon === 'checked') {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="18"
      >
        <path d="m5 12.4 4.2 4.2L19 6.8" />
      </svg>
    );
  }

  return icon;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
