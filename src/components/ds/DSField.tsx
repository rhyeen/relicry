import { Field } from '@base-ui/react';
import styles from "./DSField.module.css";
import { Required } from './Required';

type DSFieldRootProps = Readonly<{
  label: string;
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  description?: string;
  error?: string;
}>;

function DSFieldRoot({ error, description, label, value, onChange, placeholder, readonly, required }: DSFieldRootProps) {
  return (
    <Field.Root className={styles.root}>
      <Field.Label className={styles.label}><Required required={required}>{label}</Required></Field.Label>
      <Field.Control
        className={styles.control}
        required={required}
        placeholder={placeholder}
        readOnly={readonly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {!!error &&
        <Field.Error className={styles.error}>
          {error}
        </Field.Error>
      }
      {!!description &&
        <Field.Description className={styles.description}>{description}</Field.Description>
      }
    </Field.Root>
  );
}

const DSField = Object.assign(DSFieldRoot, {});

export default DSField;
