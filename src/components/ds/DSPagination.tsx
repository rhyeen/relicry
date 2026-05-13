import type { ReactNode } from 'react';
import styles from './DSPagination.module.css';

type RootProps = Readonly<{
  children: ReactNode;
  className?: string;
}>;

type TotalsProps = Readonly<{
  shown: number;
  total: number;
  label: string;
}>;

type PageIndexProps = Readonly<{
  page: number;
  totalPages: number;
}>;

type ActionsProps = Readonly<{
  onPrevious: () => void;
  onNext: () => void;
  previousDisabled?: boolean;
  nextDisabled?: boolean;
}>;

function Root({ children, className }: RootProps) {
  return (
    <nav className={[styles.root, className].filter(Boolean).join(' ')} aria-label="Pagination">
      {children}
    </nav>
  );
}

function Totals({ shown, total, label }: TotalsProps) {
  return (
    <p className={styles.meta}>
      Showing <span className={styles.value}>{shown}</span> of <span className={styles.value}>{total}</span> {label}
    </p>
  );
}

function PageIndex({ page, totalPages }: PageIndexProps) {
  return (
    <p className={styles.pageIndex}>
      Page <span className={styles.value}>{page}</span> of <span className={styles.value}>{totalPages}</span>
    </p>
  );
}

function Actions({
  onPrevious,
  onNext,
  previousDisabled = false,
  nextDisabled = false,
}: ActionsProps) {
  return (
    <div className={styles.actions}>
      <button
        className={styles.button}
        type="button"
        aria-label="Previous"
        title="Previous"
        onClick={onPrevious}
        disabled={previousDisabled}
      >
        <ArrowLeftIcon />
      </button>
      <button
        className={styles.button}
        type="button"
        aria-label="Next"
        title="Next"
        onClick={onNext}
        disabled={nextDisabled}
      >
        <ArrowRightIcon />
      </button>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width="22"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width="22"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const DSPagination = Object.assign(Root, {
  Actions,
  PageIndex,
  Totals,
});

export default DSPagination;
