import { Form } from '@base-ui/react';
import type { FormHTMLAttributes } from 'react';
import styles from "./DSForm.module.css";
import DSText from './DSText';

type DSFormErrors = Record<string, string[] | string | undefined>;

type DSFormRootProps = Readonly<{
  children: React.ReactNode;
  action?: FormHTMLAttributes<HTMLFormElement>['action'];
  onSubmit?: FormHTMLAttributes<HTMLFormElement>['onSubmit'];
  className?: string;
  errors?: DSFormErrors;
  width?: 'default' | 'full';
}>;

type DSFormTextProps = Readonly<{
  children: React.ReactNode;
  className?: string;
}>;

type DSFormButtonGroupProps = Readonly<{
  children: React.ReactNode;
}>;

function ButtonGroup({ children }: DSFormButtonGroupProps) {
  return <div className={styles.buttonGroup}>{children}</div>;
}

function DSFormRoot({ action, children, className, errors, onSubmit, width = 'default' }: DSFormRootProps) {
  const formErrors = normalizeErrors(errors);

  return (
    <Form
      action={action}
      onSubmit={onSubmit}
      className={[
        styles.root,
        width === 'full' ? styles.widthFull : undefined,
        className,
      ].filter(Boolean).join(' ')}
      errors={formErrors}
    >
      {children}
    </Form>
  );
}

function normalizeErrors(errors?: DSFormErrors) {
  if (!errors) return undefined;

  return Object.fromEntries(
    Object.entries(errors).filter((entry): entry is [string, string | string[]] => entry[1] !== undefined)
  );
}

function Title({ children, className }: DSFormTextProps) {
  return (
    <DSText.Heading as="h1" size="xl" className={[styles.title, className].filter(Boolean).join(" ")}>
      {children}
    </DSText.Heading>
  );
}

function Description({ children, className }: DSFormTextProps) {
  return (
    <DSText.Body tone="muted" size="sm" className={[styles.description, className].filter(Boolean).join(" ")}>
      {children}
    </DSText.Body>
  );
}

const DSForm = Object.assign(DSFormRoot, {
  Title,
  Description,
  ButtonGroup,
});

export default DSForm;
