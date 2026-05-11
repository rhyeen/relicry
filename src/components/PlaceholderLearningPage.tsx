import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import styles from './PlaceholderLearningPage.module.css';

type Props = Readonly<{
  eyebrow: string;
  title: string;
  copy: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}>;

export default function PlaceholderLearningPage({
  eyebrow,
  title,
  copy,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: Props) {
  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <DSText.Eyebrow>{eyebrow}</DSText.Eyebrow>
        <DSText.Heading as="h1" size="2xl" className={styles.title}>
          {title}
        </DSText.Heading>
        <DSText.Body size="lg" className={styles.copy}>{copy}</DSText.Body>
        <div className={styles.actions}>
          <DSButton href={primaryHref} label={primaryLabel} variant="primary" />
          <DSButton href={secondaryHref} label={secondaryLabel} variant="ghost" />
        </div>
      </section>
    </div>
  );
}
