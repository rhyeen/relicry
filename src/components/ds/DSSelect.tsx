import { Select } from '@base-ui/react';
import styles from "./DSSelect.module.css";
import DSField from './DSField';

type DSSelectRootProps<T> = Readonly<{
  label: string;
  options: DSSelectOption<T>[];
  onChange: (newValue: T) => void;
  placeholder?: string;
  value?: T;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>;

type DSSelectOption<T> = Readonly<{
  label: string;
  value: T;
}>;

function DSSelectRoot<T>({ disabled, loading, label, options, placeholder, value, onChange, required }: DSSelectRootProps<T>) {
  return (
    <DSField.Root>
      <DSField.Label required={required} label={label} />
      <Select.Root items={options} value={value} onValueChange={v => v ? onChange(v) : undefined}>
        <Select.Trigger
          className={styles.trigger}
          disabled={disabled || loading}
          data-loading={loading ? 'true' : undefined}
        >
          <Select.Value className={styles.value} placeholder={placeholder} />
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
    </DSField.Root>
  );
}

const DSSelect = Object.assign(DSSelectRoot, {});

export default DSSelect;
