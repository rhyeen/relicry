import Link from 'next/link';
import DSButton from '@/components/ds/DSButton';
import DSImmersivePage from '@/components/ds/DSImmersivePage';
import DSText from '@/components/ds/DSText';
import styles from './page.module.css';

const contentId = 'relicry-home-content';

const featureLinks = [
  {
    href: '/cards',
    title: 'Cards',
    copy: 'Browse focus, gambit, and deck cards built for tactical turns and dramatic swings.',
  },
  {
    href: '/events',
    title: 'Events',
    copy: 'Find active adventures and limited-time challenges for your table or community.',
  },
  {
    href: '/quests',
    title: 'Quests',
    copy: 'Follow season arcs, rewards, and objective-driven play across the world of Relicry.',
  },
  {
    href: '/art',
    title: 'Art',
    copy: 'Explore the illustrations, symbols, and visual language shaping the game.',
  },
];

export default async function Home() {
  return (
    <DSImmersivePage
      image={{
        src: '/assets/flavor/main-hero.1.ai.webp',
        alt: '',
        width: 470,
        height: 660,
        objectPosition: 'center 42%',
        priority: true,
      }}
    >
      <DSImmersivePage.Hero
        eyebrow="Welcome to the"
        title={{
          src: '/assets/flavor/logo-full.1.webp',
          alt: 'Relicry',
          width: 1280,
          height: 480,
          priority: true,
        }}
        scrollTargetId={contentId}
      />

      <DSImmersivePage.Panel id={contentId} width="wide" className={styles.panel}>
        <div className={styles.panelIntro}>
          <DSText.Eyebrow className={styles.eyebrow}>Start your run</DSText.Eyebrow>
          <DSText.Heading as="h2" size="2xl" className={styles.panelTitle}>
            A card game with an adventurer&apos;s sense of consequence.
          </DSText.Heading>
          <DSText.Body size="lg" className={styles.panelCopy}>
            Relicry blends collectible card strategy with event-driven quests, player rewards,
            and a living archive of art and lore. The home page stays cinematic up front, then
            gets out of the way so players can move quickly into the parts of the game they need.
          </DSText.Body>
        </div>

        <div className={styles.featureGrid} aria-label="Relicry sections">
          {featureLinks.map((item) => (
            <Link className={styles.featureLink} href={item.href} key={item.href}>
              <span className={styles.featureTitle}>{item.title}</span>
              <span className={styles.featureCopy}>{item.copy}</span>
            </Link>
          ))}
        </div>

        <div className={styles.panelActions}>
          <DSButton href="/events" label="Find Events" variant="primary" />
          <DSButton href="/art" label="Explore Art" variant="ghost" />
        </div>
      </DSImmersivePage.Panel>
    </DSImmersivePage>
  );
}
