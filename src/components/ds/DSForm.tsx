import { Form } from '@base-ui/react';
import styles from "./DSForm.module.css";
import DSText from './DSText';

type DSFormRootProps = Readonly<{
  children: React.ReactNode;
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

function DSFormRoot({ children }: DSFormRootProps) {
  return <Form className={styles.root}>{children}</Form>;
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
