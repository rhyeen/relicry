import "server-only";
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { isEmulated } from '@/lib/environment';
import { getExampleCard1, getExampleCard2, getExampleCard3 } from './test-data/card.data';
import { getExampleArt1, getExampleArt2, getExampleArt3, getExampleArt4 } from './test-data/art.data';
import { getExampleArtist1, getExampleArtist2, getExampleArtist3 } from './test-data/artist.data';
import { getExampleUser1, getExampleUser2, getExampleUser3 } from './test-data/user.data';
import { getExampleApex1, getExampleApex2, getExampleApex3 } from './test-data/apex.data';
import { getExampleDeck1, getExampleDeck2, getExampleDeck3 } from './test-data/deck.data';
import { getExampleEvent1, getExampleEvent2, getExampleEvent3 } from './test-data/event.data';
import { getExampleReward1, getExampleReward2, getExampleReward3 } from './test-data/reward.data';
import { getExampleEventMap1, getExampleEventMap2, getExampleEventMap3 } from './test-data/eventMap.data';
import { getExampleHerald1, getExampleHerald2, getExampleHerald3 } from './test-data/herald.data';
import { getExamplePromotedItem1, getExamplePromotedItem2, getExamplePromotedItem3 } from './test-data/promotedItem.data';
import { getExampleQuest1, getExampleQuest2, getExampleQuest3 } from './test-data/quest.data';
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

export const populateLocal = async () => {
  if (!isEmulated) {
    return;
  }
  await Promise.all([
    populateLocalCards(),
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
    populateLocalEventQuests(),
    populateLocalScenes(),
    populateLocalTrackEventQuests(),
    populateLocalPlayerCards(),
  ]);
};

const populateLocalCards = async () => {
  await new CardDB(firestoreAdmin).batchSet([
    getExampleCard1(),
    getExampleCard2(),
    getExampleCard3(),
  ]);
}

const populateLocalArt = async () => {
  const images = await Promise.all([
    seedImage({ id: 'art1', color: '#ff8c3fff' }),
    seedImage({ id: 'art2', color: '#0cbd9dff' }),
    seedImage({ id: 'art3', color: '#b133ffff' }),
  ]);
  
  await new ArtDB(firestoreAdmin).batchSet([
    getExampleArt1(images[0]),
    getExampleArt2(images[1]),
    getExampleArt3(images[2]),
    getExampleArt4(),
  ]);
}

const populateLocalArtists = async () => {
  await new ArtistDB(firestoreAdmin).batchSet([
    getExampleArtist1(),
    getExampleArtist2(),
    getExampleArtist3(),
  ]);
}

const populateLocalUsers = async () => {
  await new UserDB(firestoreAdmin).batchSet([
    getExampleUser1(),
    getExampleUser2(),
    getExampleUser3(),
  ]);
}

const populateLocalApexes = async () => {
  await new ApexDB(firestoreAdmin).batchSet([
    getExampleApex1(),
    getExampleApex2(),
    getExampleApex3(),
  ]);
}

const populateLocalDecks = async () => {
  await new DeckDB(firestoreAdmin).batchSet([
    getExampleDeck1(),
    getExampleDeck2(),
    getExampleDeck3(),
  ]);
}

const populateLocalEvents = async () => {
  await new EventDB(firestoreAdmin).batchSet([
    getExampleEvent1(),
    getExampleEvent2(),
    getExampleEvent3(),
  ]);
}

const populateLocalRewards = async () => {
  await new RewardDB(firestoreAdmin).batchSet([
    getExampleReward1(),
    getExampleReward2(),
    getExampleReward3(),
  ]);
}

const populateLocalEventMaps = async () => {
  await new EventMapDB(firestoreAdmin).batchSet([
    getExampleEventMap1(),
    getExampleEventMap2(),
    getExampleEventMap3(),
  ]);
}

const populateLocalHeralds = async () => {
  await new HeraldDB(firestoreAdmin).batchSet([
    getExampleHerald1(),
    getExampleHerald2(),
    getExampleHerald3(),
  ]);
}

const populateLocalPromotedItems = async () => {
  await new PromotedItemDB(firestoreAdmin).batchSet([
    getExamplePromotedItem1(),
    getExamplePromotedItem2(),
    getExamplePromotedItem3(),
  ]);
}

const populateLocalQuests = async () => {
  await new QuestDB(firestoreAdmin).batchSet([
    getExampleQuest1(),
    getExampleQuest2(),
    getExampleQuest3(),
  ]);
}

const populateLocalEventQuests = async () => {
  await new EventQuestDB(firestoreAdmin).batchSet([
    getExampleEventQuest1(),
    getExampleEventQuest2(),
    getExampleEventQuest3(),
  ]);
}

const populateLocalScenes = async () => {
  await new SceneDB(firestoreAdmin).batchSet([
    getExampleScene1(),
    getExampleScene2(),
    getExampleScene3(),
  ]);
}

const populateLocalTrackEventQuests = async () => {
  await new TrackQuestEventDB(firestoreAdmin).batchSet([
    getExampleTrackEventQuest1(),
    getExampleTrackEventQuest2(),
    getExampleTrackEventQuest3(),
  ]);
}

const populateLocalPlayerCards = async () => {
  await new PlayerCardDB(firestoreAdmin).batchSet([
    getExamplePlayerCard1(),
    getExamplePlayerCard2(),
    getExamplePlayerCard3(),
  ]);
}
