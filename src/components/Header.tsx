import Link from 'next/link';
import styles from './Header.module.css';
import HeaderClientSlot from './client/HeaderClient.slot';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Link href="/" className={styles.logo}>
          Relicry
        </Link>
        <nav className={styles.nav}>
          <Link href="/cards" className={styles.navLink}>
            Cards
          </Link>
          <Link href="/art" className={styles.navLink}>
            Art
          </Link>
        </nav>
      </div>
      <HeaderClientSlot />
    </header>
  );
}
