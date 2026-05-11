import Link from 'next/link';
import styles from './DSSection.module.css';

function Root({
  children,
  id,
}: Readonly<{
  children: React.ReactNode;
  id?: string;
}>) {
  return (
    <section className={styles.root} id={id}>
      {children}
    </section>
  );
}

function Card({
  children,
  background = 'light',
  width = 'full',
  padding = 'normal',
  step,
  href,
  id,
}: Readonly<{
  children: React.ReactNode;
  padding?: 'normal' | 'thick';
  step?: number;
  background?: 'light' | 'dark' | 'darkBrown';
  width?: 'full' | 'fit-content' | 'form';
  href?: string;
  id?: string;
}>) {
  const stylesJoin = [
    styles.root,
    styles.card,
  ];
  if (width === 'fit-content') {
    stylesJoin.push(styles.fitContent);
  } else if (width === 'form') {
    stylesJoin.push(styles.form);
  }
  if (padding === 'thick') {
    stylesJoin.push(styles.thickPadding);
  }
  switch (background) {
    case 'dark':
      stylesJoin.push(styles.dark);
      break;
    case 'darkBrown':
      stylesJoin.push(styles.darkBrown);
      break;
    default:
      stylesJoin.push(styles.light);
  }
  if (href) {
    stylesJoin.push(styles.cardLink);
  }
  const content = (
    <>
      {step !== undefined && <span className={styles.stepNumber}>{step}</span>}
      {children}
    </>
  );
  return href ? (
    <Link href={href} className={stylesJoin.join(' ')} id={id}>
      {content}
    </Link>
  ) : (
    <section className={stylesJoin.join(' ')} id={id}>
      {content}
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