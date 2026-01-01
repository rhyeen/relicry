import Link from 'next/link';
import styles from './Footer.module.css';
import FooterYear from './FooterYear';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <a href="mailto:relicry@googlegroups.com" className={styles.link}>
          Contact Us
        </a>
        <Link href="/feedback" className={styles.link}>
          Feedback
        </Link>
        <a href="https://discord.gg/YF5RyAaj" target="_blank" rel="noopener noreferrer" className={styles.link}>
          Discord
        </a>
      </div>
      <p className={styles.copyright}>&copy; <FooterYear /> Relicry. All rights reserved.</p>
    </footer>
  );
}
