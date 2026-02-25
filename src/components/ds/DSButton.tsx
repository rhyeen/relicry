import { Button } from '@base-ui/react';
import styles from "./DSButton.module.css";

type DSButtonRootProps = Readonly<{
  label: string;
  onClick?: () => void;
  dialogTrigger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
}>;

function DSButtonRoot({ href, label, onClick, dialogTrigger, disabled, loading }: DSButtonRootProps) {
  const isLink = !!href;
  const isNative = !dialogTrigger && !isLink;
  return (
    <Button
      className={styles.button}
      onClick={onClick}
      nativeButton={isNative}
      render={isLink ? <a href={href} /> : isNative ? undefined : <div />}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
    >
      {label}
    </Button>
  );
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
