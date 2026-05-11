import type { Metadata } from 'next';
import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Relicry Scan QR',
  description: 'Relicry player QR codes are scanned by administrators during events.',
};

export default function ScanInfoPage() {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <DSText.Eyebrow>Player QR</DSText.Eyebrow>
        <DSText.Heading as="h1" size="2xl" className={styles.title}>
          This code is for Relicry administrators to scan.
        </DSText.Heading>
        <DSText.Body className={styles.copy}>
          If you opened this page directly, you do not need to do anything here. Show your QR code
          to the event administrator, and their event scanner will handle the next step.
        </DSText.Body>
        <div className={styles.actions}>
          <DSButton href="/join" label="Join Relicry" variant="primary" />
          <DSButton href="/profile" label="View Profile" variant="ghost" />
        </div>
      </section>
    </div>
  );
}
