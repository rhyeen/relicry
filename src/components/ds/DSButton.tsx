import { Button } from '@base-ui/react';
import styles from "./DSButton.module.css";

type DSButtonRootProps = Readonly<{
  label: string;
  onClick: () => void;
}>;

function DSButtonRoot({ label, onClick }: DSButtonRootProps) {
  return (
    <Button
      className={styles.button}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
