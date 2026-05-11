import DSButton from '@/components/ds/DSButton';
import DSImmersivePage from '@/components/ds/DSImmersivePage';
import DSText from '@/components/ds/DSText';
import BeginStepModules, { BeginStep } from './BeginStepModules';
import styles from './page.module.css';

const contentId = 'relicry-begin-content';
const discordUrl = 'https://discord.gg/wbbsUEpC';

const steps: BeginStep[] = [
  {
    id: 'login',
    eyebrow: 'Step 1',
    title: 'Log in and register your starter deck',
    summary: 'Before quests begin, Relicry needs to know who has claimed a starter deck.',
    body: [
      'Relicry is free to play, which means moderators need a fair way to track starter decks, quest progress, cards, and rewards. Logging in lets the game remember that you have already secured your starter deck and helps prevent people from claiming more cards or loot than they should.',
      'At the Relicry booth, a moderator will scan your QR code before letting you continue. You will also register which starter deck you chose. Most players will already have done this before reaching this page, but this is the checkpoint if you still need it.',
    ],
    callout: 'Do not worry: logging in is not a paywall. It is just how Relicry keeps a free event fair.',
    cta: 'auth',
  },
  {
    id: 'quest-loop',
    eyebrow: 'Step 2',
    title: 'Get a quest and follow the loop',
    summary: 'Quests send you through the event, then back to the Relicry booth for the finale.',
    body: [
      'The core loop is simple: get a quest from the Relicry booth, follow that quest to collect the required quest tokens, return to the booth, and face the Apex.',
      'Win or lose, completing the quest gives you another booster pack. If you win the Apex, you also earn a reward that can be redeemed with specific vendors. Greater quest challenge levels mean tougher battles and better rewards.',
    ],
    callout: 'Your next move: go get the Challenge Level 1 quest from the Relicry booth.',
    cta: 'events',
  },
  {
    id: 'scenes',
    eyebrow: 'Step 3',
    title: 'Try scenes and collect quest tokens',
    summary: 'Scenes are quick story moments hosted by vendors or moderators.',
    body: [
      'A scene is a short choose-your-own-path moment. A host tells you what is happening, your group decides how to respond, and that choice points toward a skill test.',
      'Skill tests usually ask for aspects: Brave, Wise, Cunning, Charming, or something in between. Cards in your deck have aspects tied to them, and the scene may ask one player in your party of 1-4 to draw a set number of cards and reveal enough matching aspects.',
      'Team up when you can. Different decks are better at different tests, and some scenes may ask something unusual of the group. Win or lose, you get the quest token, but success may grant a special prize or card.',
    ],
    callout: 'Your next move: visit the quest locations, collect the tokens, and try a scene for yourself.',
    cta: 'cards',
  },
  {
    id: 'apex',
    eyebrow: 'Step 4',
    title: 'Face the Apex',
    summary: 'The Apex is the final battle for a quest and the main card challenge.',
    body: [
      'Once you have every token required by the quest, return to the Relicry booth. This is where the real challenge begins: your party faces an Apex.',
      'Cards have symbols for draw limit, aspects, tags, rarity, scrap costs, QR codes, and effects. If you are ever unsure how a card works, scan its QR code. The card page gives a plain-English rundown of what it does.',
      'After the Apex, you receive a booster pack with more cards to add to your deck. If you win, you also receive a reward to redeem with one of the Heralds so you can claim your loot.',
    ],
    callout: 'Your next move: go face the Apex.',
    cta: 'profile',
  },
];

const optionalLinks = [
  {
    href: '/rules',
    title: 'Full Rulebook',
    copy: 'Read the complete rules once you are ready for deeper card interactions.',
  },
  {
    href: '/pvp',
    title: 'PvP Battles',
    copy: 'Learn how to battle friends for fun outside the main quest loop.',
  },
  {
    href: '/collection',
    title: 'Save Your Deck',
    copy: 'Keep track of cards and prepare your favorite deck builds.',
  },
  {
    href: '/lore',
    title: 'Lore and Stories',
    copy: 'Explore the world, characters, art, and stories behind Relicry.',
  },
  {
    href: discordUrl,
    title: 'Join Discord',
    copy: 'Ask questions, find players, and keep up with announcements.',
    external: true,
  },
];

export default async function Begin() {
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
        subtitle="Starter deck in hand? Start here and learn how your first quest works."
        scrollTargetId={contentId}
      />

      <section className={styles.content} id={contentId}>
        <div className={styles.intro}>
          <DSText.Eyebrow>Starter guide</DSText.Eyebrow>
          <DSText.Heading as="h2" size="2xl" className={styles.title}>
            Follow these steps before your first quest.
          </DSText.Heading>
          <DSText.Body size="lg" className={styles.copy}>
            This guide explains what to do after receiving your starter deck. Read each step,
            mark it reviewed, then head back into the event when you are ready.
          </DSText.Body>
        </div>

        <BeginStepModules steps={steps} />

        <section className={styles.optionalSection} aria-labelledby="learn-more">
          <div className={styles.optionalHeader}>
            <DSText.Eyebrow>Optional next steps</DSText.Eyebrow>
            <DSText.Heading as="h2" id="learn-more">Keep learning</DSText.Heading>
          </div>
          <div className={styles.optionalGrid}>
            {optionalLinks.map((link) => (
              <a
                className={styles.optionalCard}
                href={link.href}
                key={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
              >
                <span className={styles.optionalTitle}>{link.title}</span>
                <span className={styles.optionalCopy}>{link.copy}</span>
              </a>
            ))}
          </div>
          <div className={styles.actions}>
            <DSButton href="/profile" label="View Your Profile" variant="primary" />
            <DSButton href="/about" label="About Relicry" variant="ghost" />
          </div>
        </section>
      </section>
    </DSImmersivePage>
  );
}
