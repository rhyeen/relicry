import { Field, ToggleGroup } from '@base-ui/react';
import styles from "./DSToggleGroup.module.css";
import DSToggle from './DSToggle';

type DSToggleGroupRootProps = Readonly<{
  label?: string;
  ariaLabel?: string;
  values?: string[];
  onChange: (values: string[]) => void;
  children?: React.ReactNode;
  multiple?: boolean;
}>;

type DSToggleGroupTextProps = Readonly<{
  label?: string;
  ariaLabel?: string;
  values?: string[];
  onChange: (values: string[]) => void;
  options: DSToggleGroupOptionProps[];
  multiple?: boolean;
}>;

type DSToggleGroupOptionProps = Readonly<{
  label: string;
  value: string;
}>;

function DSToggleGroupRoot({ ariaLabel, multiple, label, values, onChange, children }: DSToggleGroupRootProps) {
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
      <Field.Root className={styles.root}>
        <Field.Label className={styles.label}>{label}</Field.Label>
        {inner()}
      </Field.Root>
    );
  } else {
    return inner();
  }
}

function DSToggleGroupText({ ariaLabel, multiple, label, values, onChange, options }: DSToggleGroupTextProps) {
  return (
    <DSToggleGroupRoot
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
        />
      ))}
    </DSToggleGroupRoot>
  );
}

const DSToggleGroup = Object.assign(DSToggleGroupRoot, {
  Text: DSToggleGroupText,
});

export default DSToggleGroup;
