import type { Metadata } from 'next';
import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import DSSection from '@/components/ds/DSSection';
import DSPage from '@/components/ds/DSPage';
import DSLink from '@/components/ds/DSLink';

export const metadata: Metadata = {
  title: 'About Relicry',
  description: 'Learn how Relicry combines collectible cards, local events, quests, and rewards.',
};

const journeySteps = [
  {
    title: 'Start at an event',
    copy: 'Relicry is built for game stores, conventions, and local gatherings. You get a starter deck and as you progress you will earn more cards. The game is entirely free to play with no cost to you. Just show up and have fun!',
  },
  {
    title: 'Follow a quest',
    copy: 'Team up with other players or go solo by tackling quests. Quests send you to participating hosts or vendors at the event called "Heralds". Heralds will give you tokens as a symbol of completing that task in the quest.',
  },
  {
    title: 'Face challenges together',
    copy: 'Along your quest, you will use your deck to overcome challenges, face foes, support your adventuring party, and if you finish victorious you will earn sweet sweet loot.',
  },
  {
    title: 'Earn cards and rewards',
    copy: 'Harder victories can unlock stronger rewards, including vendor prizes, raffles, or discounts. Win or lose, completing a quest gives you a booster pack to open and upgrade your deck.',
  },
];

const cardParts = [
  {
    title: 'Draw limit',
    copy: 'The number at the top of a card controls how far your turn can keep going. Draw and play cards until your current limit is reached, unless an effect changes that.',
  },
  {
    title: 'Aspects and tags',
    copy: 'Colors such as Brave, Wise, Charming, and Cunning shape what a card does. Tags like item, magic, weapon, or focus let other cards and challenges care about what you played.',
  },
  {
    title: 'Scrapping',
    copy: 'Some cards ask you to scrap another played card as a cost. Scrapped cards still count lightly toward your limit, but their main contribution is spent.',
  },
  {
    title: 'QR codes',
    copy: 'Each card can lead to a permanent page with expanded art, details, story text, artist information, or event-specific context.',
  },
];

const playModes = [
  {
    title: 'Scenes',
    copy: 'Short roleplaying moments, puzzles, or tests hosted during a quest stop. They often give a small bonus if you succeed, but still move the quest forward if you fail.',
  },
  {
    title: 'Apexes',
    copy: 'The main cooperative battles. A group of players reveals a foe, locks in their decks, then each player takes a turn trying to bring its health to zero.',
  },
  {
    title: 'Player battles',
    copy: 'Decks can also be played against other players or teams for fun. This mode is more about showing off your deck than being the main balance target.',
  },
];

export default function AboutPage() {
  return (
    <DSPage>
      <DSSection>
        <DSSection.Heading>
          <DSText.Eyebrow>About Relicry</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl" id="about-relicry">
            A collectible card adventure played in the real world.
          </DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg">
            Relicry combines trading cards, cooperative encounters, local events, and vendor rewards.
            You collect cards, scan QR codes, visit quest locations, and build a deck that grows with
            each adventure. And did we mention it is 100% free? No strings attached.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <DSButton href="/join" label="I'm Ready to Join" variant="primary" />
          <DSButton href="/events" label="Find an Event" variant="ghost" />
        </DSSection.Actions>
      </DSSection>

      <DSSection>
        <DSSection.Heading>
          <DSText.Eyebrow>How it works</DSText.Eyebrow>
          <DSText.Heading as="h2" id="how-it-works">The event loop</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Grid columns={journeySteps.length}>
          {journeySteps.map((step, index) => (
            <DSSection.Card key={step.title} step={index + 1}>
              <DSSection.Text>
                <DSText.Heading as="h3">{step.title}</DSText.Heading>
                <DSText.Body>{step.copy}</DSText.Body>
              </DSSection.Text>
            </DSSection.Card>
          ))}
        </DSSection.Grid>
      </DSSection>

      <DSSection>
        <DSSection>
          <DSSection.Heading>
            <DSText.Eyebrow>Cards</DSText.Eyebrow>
            <DSText.Heading as="h2" id="cards">Simple to start, deeper as you play</DSText.Heading>
          </DSSection.Heading>
          <DSSection.Text>
            <DSText.Body>
              A Relicry deck looks familiar if you have played card games before, but the cards are
              tuned for quick event encounters. Most games last a single turn where you draw cards, activate their effects, and working with your adventuring group to create a one-hit-combo. The real strategy is in how you build your deck over time to maximize your odds of a one-turn victory.
            </DSText.Body>
          </DSSection.Text>
        </DSSection>
        <DSSection.Grid columns={2}>
          {cardParts.map((part) => (
            <DSSection.Card key={part.title}>
               <DSSection.Text>
                <DSText.Heading as="h4">{part.title}</DSText.Heading>
                <DSText.Body>{part.copy}</DSText.Body>
              </DSSection.Text>
            </DSSection.Card>
          ))}
        </DSSection.Grid>
      </DSSection>

      <DSSection>
        <DSSection.Heading>
          <DSText.Eyebrow>Play modes</DSText.Eyebrow>
          <DSText.Heading as="h2" id="play-modes">Different ways to play</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Grid columns={playModes.length}>
          {playModes.map((mode) => (
            <DSSection.Card key={mode.title}>
              <DSSection.Text>
                <DSText.Heading as="h3">{mode.title}</DSText.Heading>
                <DSText.Body>{mode.copy}</DSText.Body>
              </DSSection.Text>
            </DSSection.Card>
          ))}
        </DSSection.Grid>
      </DSSection>

      <DSSection>
        <DSSection.Heading>
          <DSText.Eyebrow>Join the game</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl" id="about-relicry">
            Excited yet?
          </DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg">
            Now that you know how the game works, the best way to get a real feel for it is to jump in and try it out.
            If you are at an event hosting Relicry, head to the Relicry booth then click the button below for the next steps.
          </DSText.Body>
        </DSSection.Text>
        <DSSection.Actions>
          <DSButton href="/join" label="Take the Next Steps" variant="primary" />
          <DSButton href="/events" label="Find an Event" variant="ghost" />
        </DSSection.Actions>
      </DSSection>

      <DSSection.Card background="dark">
        <DSSection.Heading>
          <DSText.Eyebrow>For hosts and creators</DSText.Eyebrow>
          <DSText.Heading as="h2" id="hosts">Built to make events more alive</DSText.Heading>
        </DSSection.Heading>
        <DSText.Body>
          Relicry can send players toward participating booths, artists, writers, vendors, or game
          masters. Some hosts simply hand out quest tokens. Others narrate scenes, run encounters,
          or contribute art and story that appears on cards.
        </DSText.Body>
        <DSLink href="/feedback">Share feedback or ask about participating</DSLink>
      </DSSection.Card>
    </DSPage>
  );
}
