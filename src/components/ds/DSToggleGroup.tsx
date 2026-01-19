import { Field, ToggleGroup } from '@base-ui/react';
import styles from "./DSToggleGroup.module.css";
import DSToggle from './DSToggle';
import { Required } from './Required';

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
      <Field.Root className={styles.root}>
        <Field.Label className={styles.label}><Required minimum={minimum} maximum={maximum}>{label}</Required></Field.Label>
        {inner()}
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
  } else {
    return inner();
  }
}

function DSToggleGroupText<T>({ error, description, minimum, maximum, ariaLabel, multiple, label, values, onChange, options }: DSToggleGroupTextProps<T>) {
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
        />
      ))}
    </DSToggleGroupRoot>
  );
}

const DSToggleGroup = Object.assign(DSToggleGroupRoot, {
  Text: DSToggleGroupText,
});

export default DSToggleGroup;
