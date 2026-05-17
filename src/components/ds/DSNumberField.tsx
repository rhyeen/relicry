'use client';

import { NumberField } from '@base-ui/react';
import DSField from './DSField';
import styles from './DSNumberField.module.css';

type DSNumberFieldProps = Readonly<{
  label: string;
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  max?: number;
  min?: number;
  name?: string;
  onChange?: (value: number | null) => void;
  required?: boolean;
  step?: number;
  value?: number | null;
}>;

export default function DSNumberField({
  className,
  description,
  disabled,
  error,
  label,
  max,
  min,
  name,
  onChange,
  required,
  step = 1,
  value,
}: DSNumberFieldProps) {
  return (
    <DSField.Root className={className} invalid={!!error} name={name}>
      <DSField.Label label={label} required={required} minimum={min} maximum={max} />
      <NumberField.Root
        className={styles.root}
        disabled={disabled}
        max={max}
        min={min}
        name={name}
        onValueChange={onChange}
        required={required}
        step={step}
        value={value}
      >
        <NumberField.Group className={styles.group}>
          <NumberField.Decrement className={styles.stepper} aria-label={`Decrease ${label}`}>
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M6 12h12" />
            </svg>
          </NumberField.Decrement>
          <NumberField.Input className={styles.input} />
          <NumberField.Increment className={styles.stepper} aria-label={`Increase ${label}`}>
            <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
              <path d="M12 6v12" />
              <path d="M6 12h12" />
            </svg>
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
      <DSField.Error error={error} />
      <DSField.Description description={description} />
    </DSField.Root>
  );
}
