import Link from 'next/link';
import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import styles from './page.module.css';

export default function ProfilePage() {
  return (
    <div className={styles.page}>
      <section className={styles.panel} aria-labelledby="profile-title">
        <DSText.Eyebrow className={styles.eyebrow}>Player profile</DSText.Eyebrow>
        <DSText.Heading as="h1" size="display" className={styles.title} id="profile-title">
          Your Relicry profile
        </DSText.Heading>
        <DSText.Body size="lg" className={styles.copy}>
          This profile page is a starting point for player identity, collection highlights,
          event history, and quest progress. The full profile experience can grow here without
          changing the avatar menu.
        </DSText.Body>
        <div className={styles.actions}>
          <DSButton href="/cards" label="Browse Cards" variant="primary" />
          <Link href="/" className={styles.homeLink}>
            Return home
          </Link>
        </div>
      </section>
    </div>
  );
}
