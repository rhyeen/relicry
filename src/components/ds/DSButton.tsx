import { Button } from '@base-ui/react';
import Link from 'next/link';
import styles from "./DSButton.module.css";

type DSButtonRootProps = Readonly<{
  label: string;
  onClick?: () => void;
  dialogTrigger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'lg';
}>;

function DSButtonRoot({
  href,
  label,
  onClick,
  dialogTrigger,
  disabled,
  loading,
  variant = 'secondary',
  size = 'md',
}: DSButtonRootProps) {
  const isLink = !!href;
  const isNative = !dialogTrigger && !isLink;
  const className = [
    styles.button,
    styles[`variant${capitalize(variant)}`],
    styles[`size${capitalize(size)}`],
  ].join(' ');

  if (isLink) {
    const isDisabled = disabled || loading;

    if (!isDisabled) {
      return (
        <Link
          className={className}
          href={href}
          data-loading={loading ? 'true' : undefined}
          onClick={onClick}
        >
          {label}
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
        tabIndex={-1}
      >
        {label}
      </a>
    );
  }

  return (
    <Button
      className={className}
      onClick={onClick}
      nativeButton={isNative}
      render={isNative ? undefined : <div />}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
    >
      {label}
    </Button>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
