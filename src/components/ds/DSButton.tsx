import { Button } from '@base-ui/react';
import styles from "./DSButton.module.css";

type DSButtonRootProps = Readonly<{
  label: string;
  onClick: () => void;
  dialogTrigger?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>;

function DSButtonRoot({ label, onClick, dialogTrigger, disabled, loading }: DSButtonRootProps) {
  const isNative = !dialogTrigger;
  return (
    <Button
      className={styles.button}
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

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
