import Link from 'next/link';
import DSButton from '@/components/ds/DSButton';
import DSImmersivePage from '@/components/ds/DSImmersivePage';
import DSText from '@/components/ds/DSText';
import styles from './page.module.css';
import { Suspense } from 'react';
import { cacheLife, cacheTag } from 'next/cache';
import { connection } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { LOCAL_CACHE_TAG } from '@/lib/local';
import { getCardDocId } from '@/entities/Card';
import { CardType } from '@/entities/CardContext';
import Card from '@/components/card/Card';
import { getArt } from '@/server/cache/art.cache';
import { getArtist } from '@/server/cache/artist.cache';
import { CardDB } from '@/server/db/card.db';
import HomeHeroCardLink from './HomeHeroCardLink';

const contentId = 'relicry-home-content';
const HERO_FEATURED_CARD_COUNT = 3;

const featureLinks = [
  {
    href: '/cards',
    title: 'Cards',
    copy: 'Browse all the different cards you may come across in your adventures.',
  },
  {
    href: '/events',
    title: 'Events',
    copy: 'Find active adventures and limited-time challenges near you.',
  },
  {
    href: '/begin',
    title: 'Begin',
    copy: 'Start here if you have your starter deck & are looking for the next step!',
  },
  {
    href: '/art',
    title: 'Art',
    copy: 'Explore the illustrations and artists behind the cards and the world of Relicry.',
  },
];

const locales = {
  panel: {
    eyebrow: 'Join the adventure',
    title: 'Find a local event, pick your deck, and become part of the story.',
    copy: 'Relicry is a free-to-play collectible card game that you take part in by joining local events hosting a Relicry experience. You will obtain your starter deck and open booster packs by attending the event, fulfilling quests, and joining other players to face off against challenging foes. When victorious, you will be granted rewards that can be redeemed for prizes from event vendors. Take your deck home with you, bring it again to the next event, grow your collection, strengthen your team, and take on greater challenges for greater rewards. The adventure is waiting for you at your local game store, convention, or wherever players gather to share in the fun of Relicry.',
  },
};

async function getHomeFeaturedCards() {
  'use cache';

  cacheLife('expectedChangeLowConsequenceIfStale');
  cacheTag(LOCAL_CACHE_TAG);
  cacheTag('cards:home-featured');

  const cards = await new CardDB(getFirestoreAdmin()).getLatestFeatured(HERO_FEATURED_CARD_COUNT);

  return Promise.all(
    cards.map(async (card) => {
      const [art, artist] = await Promise.all([
        getArt(card.illustration.artId),
        getArtist(card.illustration.artistId),
      ]);

      return { card, art, artist };
    })
  );
}

export default async function Home() {
  return (
    <DSImmersivePage
      image={{
        src: '/assets/flavor/card-hero.1.ai.webp',
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
      >
        <Suspense fallback={null}>
          <HomeFeaturedCards />
        </Suspense>
      </DSImmersivePage.Hero>

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

async function HomeFeaturedCards() {
  await connection();
  const featuredCards = await getHomeFeaturedCards();

  if (featuredCards.length === 0) {
    return null;
  }

  return (
    <div className={styles.heroCardSpread} aria-label="Latest featured cards">
      {featuredCards.map(({ card, art, artist }) => (
        <HomeHeroCardLink
          href={`/${getCardDocId(card.id, card.version)}`}
          key={`${card.id}-${card.version}`}
          label={`View ${card.title || 'featured card'}`}
        >
          <Card
            card={card}
            art={art}
            artist={artist}
            ctx={{ type: CardType.Full, hideCardPartInteractions: true }}
            awakenedArt={null}
            awakenedArtist={null}
            flavorTextExtendedArt={null}
            flavorTextExtendedArtist={null}
            awakenedFlavorTextExtendedArt={null}
            awakenedFlavorTextExtendedArtist={null}
          />
        </HomeHeroCardLink>
      ))}
    </div>
  );
}
