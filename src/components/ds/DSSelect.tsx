import { Select } from '@base-ui/react';
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
  const selectedOption = useMemo(
    () => options.find((option) => Object.is(option.value, selectedValue)),
    [options, selectedValue],
  );
  const handleValueChange = useCallback((nextValue: T | null) => {
    if (nextValue === null || Object.is(nextValue, selectedValue)) {
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.(nextValue);
  }, [onChange, selectedValue, value]);

  return (
    <DSField.Root invalid={!!error} name={name}>
      <DSField.Label required={required} label={label} />
      <Select.Root
        id={selectId}
        name={name}
        required={required}
        value={selectedValue}
        onValueChange={handleValueChange}
      >
        <Select.Trigger
          className={styles.trigger}
          disabled={disabled || loading}
          data-loading={loading ? 'true' : undefined}
        >
          <Select.Value className={styles.value} placeholder={placeholder}>
            {selectedOption?.label ?? placeholder}
          </Select.Value>
          <Select.Icon className={styles.icon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
            </svg>
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner className={styles.positioner} sideOffset={8}>
            <Select.Popup className={styles.popup}>
              <Select.List className={styles.list}>
                {options.map((option, index) => (
                  <Select.Item key={index} className={styles.item} value={option.value}>
                    <Select.ItemIndicator className={styles.itemIndicator}>
                      <svg className={styles.itemIndicatorIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Select.ItemIndicator>
                    <Select.ItemText className={styles.itemText}>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>            
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      <DSField.Error error={error} />
      <DSField.Description description={description} />
    </DSField.Root>
  );
}

const DSSelect = Object.assign(DSSelectRoot, {});

export default DSSelect;
