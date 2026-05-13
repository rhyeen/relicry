import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Header.module.css';
import HeaderClientSlot from './client/HeaderClient.slot';
import HeaderNavigation from './client/HeaderNavigation';
import HeaderScrollVisibility from './client/HeaderScrollVisibility';

export default function Header() {
  return (
    <>
      <Suspense fallback={null}>
        <HeaderScrollVisibility />
      </Suspense>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <Link href="/" className={styles.logo} aria-label="Home Page">
            <Image
              className={styles.logoMark}
              src="/assets/brand/relicry-icon-square.1.png"
              alt=""
              width={148}
              height={148}
              priority
            />
            <span className={styles.tooltip}>Home Page</span>
          </Link>
          <Suspense fallback={null}>
            <HeaderNavigation />
          </Suspense>
        </div>
        <HeaderClientSlot />
      </header>
    </>
  );
}
