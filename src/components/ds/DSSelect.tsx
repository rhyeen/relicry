import { Field, Select } from '@base-ui/react';
import styles from "./DSSelect.module.css";

type DSSelectRootProps = Readonly<{
  label: string;
  options: DSSelectOption[];
  onChange: (newValue: string | null) => void;
  placeholder?: string;
  value?: string;
}>;

type DSSelectOption = Readonly<{
  label: string;
  value: string;
}>;

function DSSelectRoot({ label, options, placeholder, value, onChange }: DSSelectRootProps) {
  return (
    <Field.Root className={styles.root}>
      <Field.Label className={styles.label}>{label}</Field.Label>
      <Select.Root items={options} value={value} onValueChange={onChange}>
        <Select.Trigger className={styles.trigger}>
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
                {options.map((option) => (
                  <Select.Item key={option.value} className={styles.item} value={option.value}>
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
    </Field.Root>
  );
}

const DSSelect = Object.assign(DSSelectRoot, {});

export default DSSelect;
