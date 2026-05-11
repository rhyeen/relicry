import styles from './DSPage.module.css';

function Root({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className={styles.root}>
      <section className={styles.container}>
        {children}
      </section>
    </section>
  );
}

const DSPage = Object.assign(Root, {
  Root: Root,
});

export default DSPage;