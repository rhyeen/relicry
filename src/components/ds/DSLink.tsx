import Link from 'next/link';
import styles from './DSLink.module.css';

function Root({
  href,
  children,
}: Readonly<{
  href: string;
  
  children: React.ReactNode;
}>) {
  return (
    <Link href={href} className={styles.root}>
      {children}
    </Link>
  );
}

const DSLink = Object.assign(Root, {
  Root: Root,
});

export default DSLink;