import styles from './DSSegmentedControl.module.css';

type SegmentedOption<T extends string> = Readonly<{
  label: string;
  value: T;
}>;

type DSSegmentedControlProps<T extends string> = Readonly<{
  ariaLabel: string;
  className?: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}>;

export default function DSSegmentedControl<T extends string>({
  ariaLabel,
  className,
  options,
  value,
  onChange,
}: DSSegmentedControlProps<T>) {
  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          aria-selected={option.value === value}
          className={styles.option}
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
