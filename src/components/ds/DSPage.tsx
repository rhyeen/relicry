import Image from 'next/image';
import styles from './DSPage.module.css';

function Root({
  children,
  heroBackgroundImage,
}: Readonly<{
  children: React.ReactNode;
  heroBackgroundImage?: string;
}>) {
  return (
    <section className={styles.root}>
      {heroBackgroundImage && (
        <div className={styles.heroBackgroundBackdrop} aria-hidden="true">
          <Image
            className={styles.heroBackground}
            src={heroBackgroundImage}
            alt=""
            fill
            loading="lazy"
            sizes="100vw"
          />
          <div className={styles.heroBackgroundWash} aria-hidden="true" />
        </div>
      )}
      <section className={styles.container}>
        {children}
      </section>
    </section>
  );
}

function Hero({
  eyebrow,
  title,
  subtitle,
  children,
  scrollTargetId,
}: {
  eyebrow: string;
  title: string | { src: string; alt: string; width: number; height: number; };
  subtitle?: string;
  children?: React.ReactNode;
  scrollTargetId?: string;
}) {
  const titleIsImage = typeof title === 'object' && 'src' in title;

  return (
    <section className={styles.hero} aria-labelledby="immersive-page-title">
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1
          className={[styles.title, titleIsImage ? styles.titleGraphic : undefined].filter(Boolean).join(' ')}
          id="immersive-page-title"
        >
          {titleIsImage ? (
            <Image
              className={styles.titleImage}
              src={title.src}
              alt={title.alt}
              width={title.width}
              height={title.height}
              loading="eager"
              sizes="(max-width: 520px) calc(100vw - 2rem), 450px"
            />
          ) : title}
        </h1>
        {subtitle && <p className={styles.subtitle} id="immersive-page-subtitle">{subtitle}</p>}
        {children && <div className={styles.heroSlot}>{children}</div>}
      </div>
      {scrollTargetId && <ScrollCue targetId={scrollTargetId} />}
    </section>
  );
}

function ScrollCue({ targetId, label = 'Scroll to content' }: Readonly<{
  targetId: string;
  label?: string;
}>) {
  return (
    <a className={styles.scrollCue} href={`#${targetId}`} aria-label={label}>
      <span aria-hidden="true" />
    </a>
  );
}

const DSPage = Object.assign(Root, {
  Root,
  Hero,
  ScrollCue,
});

export default DSPage;