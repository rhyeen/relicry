import styles from './DSSection.module.css';

function Root({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className={styles.root}>
      {children}
    </section>
  );
}

function Card({
  children,
  background = 'light',
  width = 'full',
  step,
}: Readonly<{
  children: React.ReactNode;
  step?: number;
  background?: 'light' | 'dark';
  width?: 'full' | 'fit-content';
}>) {
  return (
    <section className={`${styles.root} ${styles.card} ${background === 'dark' ? styles.dark : styles.light} ${width === 'fit-content' ? styles.fitContent : ''}`}>
      {step !== undefined && <span className={styles.stepNumber}>{step}</span>}
      {children}
    </section>
  );
}

function Heading({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.heading}>
      {children}
    </div>
  );
}

function Text({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.text}>
      {children}
    </div>
  );
}

function Actions({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.actions}>
      {children}
    </div>
  );
}


function Grid({
  columns,
  children,
}: Readonly<{
  columns: number;
  children: React.ReactNode;
}>) {
  return (
    <div className={`${styles.grid} ${styles[`columns${columns}`]}`}>
      {children}
    </div>
  );
}

const DSSection = Object.assign(Root, {
  Root: Root,
  Text: Text,
  Heading: Heading,
  Actions: Actions,
  Grid: Grid,
  Card: Card,
});

export default DSSection;