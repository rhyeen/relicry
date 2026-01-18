import { Field, Switch } from '@base-ui/react';
import styles from "./DSSwitch.module.css";

type DSSwitchRootProps = Readonly<{
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
}>;

function DSSwitchRoot({ label, checked, onChange }: DSSwitchRootProps) {
  return (
    <Field.Root className={styles.root}>
      <Field.Label className={styles.label}>
        <Switch.Root
          checked={checked}
          className={styles.switch}
          onCheckedChange={onChange}
        >
          <Switch.Thumb className={styles.thumb} />
        </Switch.Root>
        {label}
      </Field.Label>
    </Field.Root>
  );
}

const DSSwitch = Object.assign(DSSwitchRoot, {});

export default DSSwitch;
