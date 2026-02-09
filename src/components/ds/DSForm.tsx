import { Form } from '@base-ui/react';
import styles from "./DSForm.module.css";

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
    <h1 className={[styles.title, className].filter(Boolean).join(" ")}>
      {children}
    </h1>
  );
}

function Description({ children, className }: DSFormTextProps) {
  return (
    <p className={[styles.description, className].filter(Boolean).join(" ")}>
      {children}
    </p>
  );
}

const DSForm = Object.assign(DSFormRoot, {
  Title,
  Description,
  ButtonGroup,
});

export default DSForm;
