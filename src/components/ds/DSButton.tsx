import { Button } from '@base-ui/react';
import styles from "./DSButton.module.css";

type DSButtonRootProps = Readonly<{
  label: string;
  onClick: () => void;
  dialogTrigger?: boolean;
}>;

function DSButtonRoot({ label, onClick, dialogTrigger }: DSButtonRootProps) {
  const isNative = !dialogTrigger;
  return (
    <Button
      className={styles.button}
      onClick={onClick}
      nativeButton={isNative}
      render={isNative ? undefined : <div />}
    >
      {label}
    </Button>
  );
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
