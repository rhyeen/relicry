import Image from 'next/image';
import Link from 'next/link';
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

function Back({
  href,
  label = 'Back',
}: Readonly<{
  href: string;
  label?: string;
}>) {
  return (
    <Link className={styles.back} href={href} aria-label={label}>
      <svg
        aria-hidden="true"
        className={styles.backIcon}
        fill="none"
        height="22"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        viewBox="0 0 24 24"
        width="22"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
      <span className={styles.backTooltip}>{label}</span>
    </Link>
  );
}

const DSPage = Object.assign(Root, {
  Back,
  Root,
  Hero,
  ScrollCue,
});

export default DSPage;
