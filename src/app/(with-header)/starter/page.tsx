import type { Metadata } from 'next';
import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Starter Deck Scan',
  description: 'Starter deck scans now happen from each event page.',
};

export default function StarterPage() {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <DSText.Eyebrow>Starter deck scan</DSText.Eyebrow>
        <DSText.Heading as="h1" size="2xl" className={styles.title}>
          Starter scans now happen from an event page.
        </DSText.Heading>
        <DSText.Body className={styles.copy}>
          Open the event you are administering, then use its starter deck scan page. Player QR
          codes stay the same, and the event page decides what the scan means.
        </DSText.Body>
        <DSButton href="/events" label="View Events" variant="primary" />
      </section>
    </div>
  );
}
