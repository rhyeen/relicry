"use client";

import { useCallback, useId, useMemo, useState } from 'react';
import styles from "./DSSelect.module.css";
import DSField from './DSField';

type DSSelectRootProps<T> = Readonly<{
  id?: string;
  label: string;
  name?: string;
  options: DSSelectOption<T>[];
  onChange?: (newValue: T) => void;
  placeholder?: string;
  value?: T;
  defaultValue?: T;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  description?: string;
  error?: string;
}>;

type DSSelectOption<T> = Readonly<{
  label: string;
  value: T;
}>;

function DSSelectRoot<T>({
  defaultValue,
  description,
  disabled,
  error,
  id,
  loading,
  label,
  name,
  options,
  placeholder,
  value,
  onChange,
  required,
}: DSSelectRootProps<T>) {
  const fallbackId = useId();
  const selectId = id ?? fallbackId;
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue ?? null);
  const selectedValue = value ?? internalValue;
  const selectedIndex = useMemo(
    () => options.findIndex((option) => Object.is(option.value, selectedValue)),
    [options, selectedValue],
  );
  const selectedKey = selectedIndex >= 0 ? String(selectedIndex) : '';
  const handleValueChange = useCallback((nextKey: string) => {
    if (nextKey === '') {
      return;
    }

    const nextValue = options[Number(nextKey)]?.value;
    if (nextValue === undefined || Object.is(nextValue, selectedValue)) {
      return;
    }
    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }, [onChange, options, selectedValue, value]);

  return (
    <DSField.Root invalid={!!error} name={name}>
      <DSField.Label required={required} label={label} />
      <select
        aria-label={typeof label === 'string' ? label : undefined}
        className={styles.trigger}
        data-loading={loading ? 'true' : undefined}
        disabled={disabled || loading}
        id={selectId}
        name={name}
        onChange={(event) => handleValueChange(event.currentTarget.value)}
        required={required}
        value={selectedKey}
      >
        {placeholder ? (
          <option value="" disabled>{placeholder}</option>
        ) : null}
        {options.map((option, index) => (
          <option key={index} value={String(index)}>
            {option.label}
          </option>
        ))}
      </select>
      <DSField.Error error={error} />
      <DSField.Description description={description} />
    </DSField.Root>
  );
}

const DSSelect = Object.assign(DSSelectRoot, {});

export default DSSelect;
