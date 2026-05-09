import styles from './DSSpinner.module.css';

type DSSpinnerRootProps = Readonly<{
  className?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}>;

function DSSpinnerRoot({ className, label = 'Loading', size = 'md' }: DSSpinnerRootProps) {
  return (
    <span
      aria-label={label}
      className={[styles.root, styles[`size${capitalize(size)}`], className]
        .filter(Boolean)
        .join(' ')}
      role="status"
    >
      <span className={styles.ring} aria-hidden="true" />
    </span>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DSSpinner = Object.assign(DSSpinnerRoot, {});

export default DSSpinner;
