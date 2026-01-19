import { Field } from '@base-ui/react';
import styles from "./DSField.module.css";
import { Required } from './Required';

export function toDateOnlyString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromDateOnlyString(s: string): Date | null {
  // Interpret as local midnight to avoid “off by one” from UTC parsing.
  // new Date("YYYY-MM-DD") is treated as UTC by spec in many runtimes.
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return new Date(y, mo, d, 0, 0, 0, 0);
}

type DSFieldRootProps = Readonly<{
  label: string;
  value: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'url' | 'date';
  onChange: (newValue: string) => void;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  description?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
}>;

function DSFieldRoot({ disabled, loading, error, type, description, label, value, onChange, placeholder, readonly, required }: DSFieldRootProps) {
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
        type={type}
        disabled={disabled || loading}
        data-loading={loading ? 'true' : undefined}
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
