import "server-only";
import { getFirestoreAdmin } from '@/lib/firebaseAdmin';
import { isEmulated } from '@/lib/environment';
import { DEFAULT_LOCAL_CARD_COUNT, MAX_LOCAL_CARD_COUNT, normalizeLocalCardCount } from '@/lib/localPopulate';
import { getExampleCard1, getExampleCard2, getExampleCard3, getGeneratedExampleCard, getGeneratedLocalCardId } from './test-data/card.data';
import { getExampleArt1, getExampleArt2, getExampleArt3, getExampleArt4 } from './test-data/art.data';
import { getExampleArtist1, getExampleArtist2, getExampleArtist3 } from './test-data/artist.data';
import { getExampleUser1, getExampleUser2, getExampleUser3 } from './test-data/user.data';
import { getExampleApex1, getExampleApex2, getExampleApex3 } from './test-data/apex.data';
import { getExampleDeck1, getExampleDeck2, getExampleDeck3 } from './test-data/deck.data';
import { getExampleEvent1, getExampleEvent2, getExampleEvent3 } from './test-data/event.data';
import { getExampleReward1, getExampleReward2, getExampleReward3, getExampleReward4 } from './test-data/reward.data';
import { getExampleEventMap1, getExampleEventMap2, getExampleEventMap3 } from './test-data/eventMap.data';
import { getExampleHerald1, getExampleHerald2, getExampleHerald3 } from './test-data/herald.data';
import { getExamplePromotedItem1, getExamplePromotedItem2, getExamplePromotedItem3 } from './test-data/promotedItem.data';
import { getExampleQuest1, getExampleQuest2, getExampleQuest3, getExampleQuestToken1, getExampleQuestToken2, getExampleQuestToken3, getExampleQuestToken4 } from './test-data/quest.data';
import { getExampleEventQuest1, getExampleEventQuest2, getExampleEventQuest3 } from './test-data/eventQuest.data';
import { getExampleScene1, getExampleScene2, getExampleScene3 } from './test-data/scene.data';
import { getExampleTrackEventQuest1, getExampleTrackEventQuest2, getExampleTrackEventQuest3 } from './test-data/trackers.data';
import { getExamplePlayerCard1, getExamplePlayerCard2, getExamplePlayerCard3 } from './test-data/playerCard.data';
import { CardDB } from './card.db';
import { ArtDB } from './art.db';
import { ArtistDB } from './artist.db';
import { UserDB } from './user.db';
import { ApexDB } from './apex.db';
import { DeckDB } from './deck.db';
import { EventDB } from './event.db';
import { RewardDB } from './reward.db';
import { EventMapDB } from './eventMap.db';
import { HeraldDB } from './herald.db';
import { PromotedItemDB } from './promotedItem.db';
import { QuestDB } from './quest.db';
import { EventQuestDB } from './eventQuest.db';
import { SceneDB } from './scene.db';
import { TrackQuestEventDB } from './trackers.db';
import { PlayerCardDB } from './playerCard.db';
import { seedImage } from './seeds/image.seed';
import { QuestTokenDB } from './questToken.db';

export const populateLocal = async (options?: {
  cardCount?: number;
}) => {
  if (!isEmulated) {
    return { cardCount: DEFAULT_LOCAL_CARD_COUNT };
  }
  const cardCount = normalizeLocalCardCount(options?.cardCount);
  await Promise.all([
    populateLocalCards(cardCount),
    populateLocalArt(),
    populateLocalArtists(),
    populateLocalUsers(),
    populateLocalApexes(),
    populateLocalDecks(),
    populateLocalEvents(),
    populateLocalRewards(),
    populateLocalEventMaps(),
    populateLocalHeralds(),
    populateLocalPromotedItems(),
    populateLocalQuests(),
    populateLocalQuestTokens(),
    populateLocalEventQuests(),
    populateLocalScenes(),
    populateLocalTrackEventQuests(),
    populateLocalPlayerCards(),
  ]);
  return { cardCount };
};

const populateLocalCards = async (cardCount: number) => {
  const baseCards = [
    getExampleCard1(),
    getExampleCard2(),
    getExampleCard3(),
  ];
  const generatedCards = Array.from(
    { length: Math.max(0, cardCount - DEFAULT_LOCAL_CARD_COUNT) },
    (_, index) => getGeneratedExampleCard(DEFAULT_LOCAL_CARD_COUNT + index + 1),
  );
  const deleteStart = Math.max(DEFAULT_LOCAL_CARD_COUNT + 1, cardCount + 1);
  const staleGeneratedCardIds = Array.from(
    { length: Math.max(0, MAX_LOCAL_CARD_COUNT - deleteStart + 1) },
    (_, index) => getGeneratedLocalCardId(deleteStart + index),
  );

  const db = new CardDB(getFirestoreAdmin());
  await db.batchSet([...baseCards, ...generatedCards]);
  await db.batchDelete(staleGeneratedCardIds);
}

const populateLocalArt = async () => {
  const images = await Promise.all([
    seedImage({ id: 'art1', color: '#ff8c3fff' }),
    seedImage({ id: 'art2', color: '#0cbd9dff' }),
    seedImage({ id: 'art3', color: '#b133ffff' }),
  ]);
  
  await new ArtDB(getFirestoreAdmin()).batchSet([
    getExampleArt1(images[0]),
    getExampleArt2(images[1]),
    getExampleArt3(images[2]),
    getExampleArt4(),
  ]);
}

const populateLocalArtists = async () => {
  await new ArtistDB(getFirestoreAdmin()).batchSet([
    getExampleArtist1(),
    getExampleArtist2(),
    getExampleArtist3(),
  ]);
}

const populateLocalUsers = async () => {
  await new UserDB(getFirestoreAdmin()).batchSet([
    getExampleUser1(),
    getExampleUser2(),
    getExampleUser3(),
  ]);
}

const populateLocalApexes = async () => {
  await new ApexDB(getFirestoreAdmin()).batchSet([
    getExampleApex1(),
    getExampleApex2(),
    getExampleApex3(),
  ]);
}

const populateLocalDecks = async () => {
  await new DeckDB(getFirestoreAdmin()).batchSet([
    getExampleDeck1(),
    getExampleDeck2(),
    getExampleDeck3(),
  ]);
}

const populateLocalEvents = async () => {
  await new EventDB(getFirestoreAdmin()).batchSet([
    getExampleEvent1(),
    getExampleEvent2(),
    getExampleEvent3(),
  ]);
}

const populateLocalRewards = async () => {
  await new RewardDB(getFirestoreAdmin()).batchSet([
    getExampleReward1(),
    getExampleReward2(),
    getExampleReward3(),
    getExampleReward4(),
  ]);
}

const populateLocalEventMaps = async () => {
  await new EventMapDB(getFirestoreAdmin()).batchSet([
    getExampleEventMap1(),
    getExampleEventMap2(),
    getExampleEventMap3(),
  ]);
}

const populateLocalHeralds = async () => {
  await new HeraldDB(getFirestoreAdmin()).batchSet([
    getExampleHerald1(),
    getExampleHerald2(),
    getExampleHerald3(),
  ]);
}

const populateLocalPromotedItems = async () => {
  await new PromotedItemDB(getFirestoreAdmin()).batchSet([
    getExamplePromotedItem1(),
    getExamplePromotedItem2(),
    getExamplePromotedItem3(),
  ]);
}

const populateLocalQuests = async () => {
  await new QuestDB(getFirestoreAdmin()).batchSet([
    getExampleQuest1(),
    getExampleQuest2(),
    getExampleQuest3(),
  ]);
}

const populateLocalQuestTokens = async () => {
  await new QuestTokenDB(getFirestoreAdmin()).batchSet([
    getExampleQuestToken1(),
    getExampleQuestToken2(),
    getExampleQuestToken3(),
    getExampleQuestToken4(),
  ]);
}

const populateLocalEventQuests = async () => {
  await new EventQuestDB(getFirestoreAdmin()).batchSet([
    getExampleEventQuest1(),
    getExampleEventQuest2(),
    getExampleEventQuest3(),
  ]);
}

const populateLocalScenes = async () => {
  await new SceneDB(getFirestoreAdmin()).batchSet([
    getExampleScene1(),
    getExampleScene2(),
    getExampleScene3(),
  ]);
}

const populateLocalTrackEventQuests = async () => {
  await new TrackQuestEventDB(getFirestoreAdmin()).batchSet([
    getExampleTrackEventQuest1(),
    getExampleTrackEventQuest2(),
    getExampleTrackEventQuest3(),
  ]);
}

const populateLocalPlayerCards = async () => {
  await new PlayerCardDB(getFirestoreAdmin()).batchSet([
    getExamplePlayerCard1(),
    getExamplePlayerCard2(),
    getExamplePlayerCard3(),
  ]);
}
