import { ToggleGroup } from '@base-ui/react';
import styles from "./DSToggleGroup.module.css";
import DSToggle from './DSToggle';
import DSField from './DSField';

type DSToggleGroupRootProps<T> = Readonly<{
  label?: string;
  ariaLabel?: string;
  values?: T[];
  onChange: (values: T[]) => void;
  children?: React.ReactNode;
  multiple?: boolean;
  minimum?: number;
  maximum?: number;
  error?: string;
  description?: string;
}>;

type DSToggleGroupTextProps<T> = Readonly<{
  label?: string;
  ariaLabel?: string;
  values?: T[];
  onChange: (values: T[]) => void;
  options: DSToggleGroupOptionProps[];
  multiple?: boolean;
  minimum?: number;
  maximum?: number;
  error?: string;
  description?: string;
  disabled?: boolean;
  loading?: boolean;
}>;

type DSToggleGroupOptionProps = Readonly<{
  label: string;
  value: string;
}>;

function DSToggleGroupRoot<T>({ error, description, minimum, maximum, ariaLabel, multiple, label, values, onChange, children }: DSToggleGroupRootProps<T>) {
  const inner = () => (
    <ToggleGroup
      aria-label={ariaLabel || label}
      value={values}
      onValueChange={onChange}
      className={styles.group}
      multiple={multiple}
    >
      {children}
    </ToggleGroup>
  );

  if (label) {
    return (
      <DSField.Root>
        <DSField.Label minimum={minimum} maximum={maximum} label={label} />
        {inner()}
        <DSField.Error error={error} />
        <DSField.Description description={description} />
      </DSField.Root>
    );
  } else {
    return inner();
  }
}

function DSToggleGroupText<T>({ disabled, loading, error, description, minimum, maximum, ariaLabel, multiple, label, values, onChange, options }: DSToggleGroupTextProps<T>) {
  return (
    <DSToggleGroupRoot
      error={error}
      description={description}
      minimum={minimum}
      maximum={maximum}
      ariaLabel={ariaLabel}
      label={label}
      values={values}
      onChange={onChange}
      multiple={multiple}
    >
      {options.map((option) => (
        <DSToggle.Text
          label={option.label}
          key={option.value}
          value={option.value}
          disabled={disabled}
          loading={loading}
        />
      ))}
    </DSToggleGroupRoot>
  );
}

const DSToggleGroup = Object.assign(DSToggleGroupRoot, {
  Text: DSToggleGroupText,
});

export default DSToggleGroup;
