import Image from 'next/image';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import DSButton from './DSButton';
import styles from './DSImmersivePage.module.css';

export type DSImmersivePageImage = Readonly<{
  src: string;
  alt?: string;
  width: number;
  height: number;
  objectPosition?: string;
  priority?: boolean;
}>;

type Action = Readonly<{
  label: string;
  href: string;
}>;

type RootProps = Readonly<HTMLAttributes<HTMLDivElement> & {
  image: DSImmersivePageImage;
  children: ReactNode;
}>;

type HeroProps = Readonly<{
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction?: Action;
  secondaryAction?: Action;
  scrollTargetId?: string;
}>;

type PanelProps = Readonly<HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  width?: 'narrow' | 'wide';
}>;

type ScrollCueProps = Readonly<{
  targetId: string;
  label?: string;
}>;

function toSafeObjectPosition(value?: string) {
  if (!value) {
    return 'center';
  }

  return /^[\w\s.%+-]+$/.test(value) ? value : 'center';
}

function Root({ image, children, className, style, ...rest }: RootProps) {
  const imagePosition = toSafeObjectPosition(image.objectPosition);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{
        ...style,
        '--ds-immersive-image-position': imagePosition,
      } as CSSProperties}
      {...rest}
    >
      <div className={styles.backdrop} aria-hidden="true">
        <Image
          className={styles.image}
          src={image.src}
          alt={image.alt ?? ''}
          width={image.width}
          height={image.height}
          priority={image.priority}
          sizes="100vw"
        />
        <div className={styles.imageWash} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

function Hero({
  eyebrow,
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  scrollTargetId,
}: HeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="immersive-page-title">
      <div className={styles.heroInner}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title} id="immersive-page-title">
          {title}
        </h1>
        <p className={styles.subtitle}>{subtitle}</p>
        {(primaryAction || secondaryAction) && (
          <div className={styles.actions} aria-label="Primary page links">
            {primaryAction && (
              <DSButton
                href={primaryAction.href}
                label={primaryAction.label}
                variant="primary"
                size="lg"
              />
            )}
            {secondaryAction && (
              <DSButton
                href={secondaryAction.href}
                label={secondaryAction.label}
                variant="ghost"
                size="lg"
              />
            )}
          </div>
        )}
      </div>
      {scrollTargetId && <ScrollCue targetId={scrollTargetId} />}
    </section>
  );
}

function Panel({ children, className, width = 'narrow', ...rest }: PanelProps) {
  return (
    <section
      className={[
        styles.panel,
        width === 'wide' ? styles.panelWide : styles.panelNarrow,
        className,
      ].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </section>
  );
}

function ScrollCue({ targetId, label = 'Scroll to content' }: ScrollCueProps) {
  return (
    <a className={styles.scrollCue} href={`#${targetId}`} aria-label={label}>
      <span aria-hidden="true" />
    </a>
  );
}

const DSImmersivePage = Object.assign(Root, {
  Hero,
  Panel,
  ScrollCue,
});

export default DSImmersivePage;
