import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '../layout.module.css';

export default function WithHeaderLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main data-global-main className={`${styles.main} global-main`}>{children}</main>
      <div data-global-header className="global-header"><Header /></div>
      <div data-global-footer className="global-footer"><Footer /></div>
    </>
  );
}
