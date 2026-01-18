import styles from './DSSection.module.css';

export default function DSSection({
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
