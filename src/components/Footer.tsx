import Image from 'next/image';
import Link from 'next/link';
import DSText from './ds/DSText';
import styles from './Footer.module.css';
import FooterYear from './FooterYear';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Relicry home">
          <Image
            className={styles.logo}
            src="/assets/flavor/logo-full-small.1.webp"
            alt="Relicry"
            width={400}
            height={150}
            sizes="104px"
          />
        </Link>
        <nav className={styles.links} aria-label="Footer">
          <a href="mailto:relicry@googlegroups.com" className={styles.link}>
            Contact
          </a>
          <Link href="/feedback" className={styles.link}>
            Feedback
          </Link>
          <a href="https://discord.gg/wbbsUEpC" target="_blank" rel="noopener noreferrer" className={styles.link}>
            Discord
          </a>
        </nav>
        <DSText.Caption className={styles.copyright}>&copy; <FooterYear /> Relicry. All rights reserved.</DSText.Caption>
      </div>
    </footer>
  );
}
