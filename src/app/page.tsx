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

const locales = {
  panel: {
    eyebrow: 'Join the adventure',
    title: 'Find a local event, pick your deck, and become part of the story.',
    copy: 'Relicry is a free-to-play collectible card game that you take part in by joining local events hosting a Relicry experience. You will obtain your starter deck and open booster packs by attending the event, fulfilling quests, and joining other players to face off against challenging foes. When victorious, you will be granted rewards that can be redeemed for prizes from event vendors. Take your deck home with you, bring it again to the next event, grow your collection, strengthen your team, and take on greater challenges for greater rewards. The adventure is waiting for you at your local game store, convention, or wherever players gather to share in the fun of Relicry.',
  },
}

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

      <DSImmersivePage.Panel id={contentId} width="wide">
        <DSText.Eyebrow>{locales.panel.eyebrow}</DSText.Eyebrow>
        <DSText.Heading as="h2" size="2xl">{locales.panel.title}</DSText.Heading>
        <DSText.Body size="lg">{locales.panel.copy}</DSText.Body>

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
