import { Switch } from '@base-ui/react';
import styles from "./DSSwitch.module.css";
import DSField from './DSField';

type DSSwitchRootProps = Readonly<{
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  loading?: boolean;
}>;

function DSSwitchRoot({ label, checked, onChange, disabled, loading }: DSSwitchRootProps) {
  return (
    <DSField.Root>
      <DSField.Label label={
        <>
          <Switch.Root
            checked={checked}
            className={styles.switch}
            onCheckedChange={onChange}
            disabled={disabled || loading}
            data-loading={loading ? 'true' : undefined}
          >
            <Switch.Thumb className={styles.thumb} />
          </Switch.Root>
          {label}
        </>
      } inline />
    </DSField.Root>
  );
}

const DSSwitch = Object.assign(DSSwitchRoot, {});

export default DSSwitch;
