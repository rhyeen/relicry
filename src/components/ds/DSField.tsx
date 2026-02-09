import { Field } from '@base-ui/react';
import styles from "./DSField.module.css";

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
    <Root>
      <Label required={required} label={label} />
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
      <Error error={error} />
      <Description description={description} />
    </Root>
  );
}

type RootProps = Readonly<{
  children: React.ReactNode;
}>;

function Root({ children }: RootProps) {
  return (
    <Field.Root className={styles.root}>{children}</Field.Root>
  );
}

type RequiredProps = {
  required?: boolean;
  minimum?: number;
  maximum?: number;
  children: React.ReactNode;
};

function Required({ required, children, minimum, maximum }: RequiredProps) {
  if (!required) return children;
  const getMarker = () => {
    if (!minimum) {
      if (maximum) return ` (max ${maximum})`;
      return required ? ' *' : '';
    } else {
      if (maximum) return ` (${minimum}-${maximum})`;
      return ` (${minimum}+)`;
    }
  };
  return (
    <>{children}<span>{getMarker()}</span></>
  );
}

type LabelProps = Readonly<{
  label: string | React.ReactNode;
  required?: boolean;
  minimum?: number;
  maximum?: number;
  inline?: boolean;
}>;

function Label({ label, required, minimum, maximum, inline }: LabelProps) {
  return (
    <Field.Label className={styles.label} data-inline={inline ? 'true' : undefined}>
      <Required required={required} minimum={minimum} maximum={maximum}>{label}</Required>
    </Field.Label>
  );
}

type ErrorProps = Readonly<{
  error?: string;
}>;

function Error({ error }: ErrorProps) {
  return (
    <Field.Error className={styles.error} match={!!error}>{error}</Field.Error>
  );
}

type DescriptionProps = Readonly<{
  description?: string;
}>;

function Description({ description }: DescriptionProps) {
  if (!description) return null;
  return (
    <Field.Description className={styles.description}>{description}</Field.Description>
  );
}

const DSField = Object.assign(DSFieldRoot, {
  Root,
  Required,
  Label,
  Error,
  Description,
});

export default DSField;
