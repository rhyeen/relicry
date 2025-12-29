import "server-only";
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { VersionedDeckCard, VersionedFocusCard, VersionedGambitCard } from '@/entities/Card';
import { isEmulated } from '@/lib/environment';
import { Rarity } from '@/entities/Rarity';
import { Tag } from '@/entities/Tag';
import { Conditional } from '@/entities/Conditional';
import { CardEffectPartCard, CardEffectPartDamage, CardEffectPartText } from '@/entities/CardEffect';
import { Aspect } from '@/entities/Aspect';

export const populateLocal = async () => {
  if (!isEmulated) {
    return;
  }
  await populateLocalCards();
};

const populateLocalCards = async () => {
  const cards: (
    VersionedDeckCard |
    VersionedGambitCard |
    VersionedFocusCard
  )[] = [
    {
      id: '111111',
      type: 'deck',
      title: { en: 'Deck Card 1' },
      rarity: Rarity.Common,
      tags: [Tag.Item, Tag.Weapon, Tag.Blade],
      effects: [
        {
          conditionals: [Conditional.TurnEnd],
          parts: {
            en: [
              { type: 'text', text: 'Deal ' } as CardEffectPartText,
              { type: 'damage', amount: 3 } as CardEffectPartDamage,
            ],
          },
        },
      ],
      drawLimit: 3,
      scrapCost: [Aspect.Brave],
      aspect: Aspect.Brave,
      version: 1,
      season: 1,
      illustration: {
        artId: 'art/1111111111',
        artistId: 'ast/1111111111',
      },
      revealedAt: new Date(),
      publishedAt: new Date(),
      archivedAt: null,
      isSample: true,
    },
    {
      id: '111112',
      type: 'deck',
      title: { en: 'Deck Card 2' },
      rarity: Rarity.Legendary,
      tags: [Tag.Ability, Tag.Bling],
      effects: [
        {
          conditionals: [],
          parts: {
            en: [
              { type: 'text', text: 'Draw ' } as CardEffectPartText,
              { type: 'card', amount: 3 } as CardEffectPartCard,
            ],
          },
        },
      ],
      drawLimit: 5,
      scrapCost: [],
      aspect: Aspect.Charming,
      version: 1,
      season: 1,
      illustration: {
        artId: 'art/1111111112',
        artistId: 'ast/1111111111',
      },
      revealedAt: new Date(),
      publishedAt: new Date(),
      archivedAt: null,
      isSample: true,
    },
    {
      id: '111113',
      type: 'focus',
      title: { en: 'Focus Card 3' },
      rarity: Rarity.Rare,
      tags: [Tag.Focus],
      effects: [
        {
          conditionals: [Conditional.Infinite],
          parts: {
            en: [
              { type: 'text', text: 'If you have ' } as CardEffectPartText,
              { type: 'card', amount: 3, orMore: true } as CardEffectPartCard,
              { type: 'text', text: ', ' } as CardEffectPartText,
              { type: 'flip' },
            ],
          },
        },
      ],
      awakenedVersion: {
        flavorText: {
          onCard: {
            en: { text: 'Awakened focus flavor text.' },
          },
          extended: {
            artId: 'art/1111111114',
            artistId: 'ast/1111111113',
          },
        },
      },
      awakened: {
        tags: [Tag.Focus, Tag.Favor],
        effects: [
          {
            conditionals: [],
            parts: {
              en: [
                { type: 'text', text: 'Draw ' } as CardEffectPartText,
                { type: 'card', amount: 3 } as CardEffectPartCard,
              ],
            },
          },
        ],
      },
      aspect: Aspect.Cunning,
      version: 1,
      season: 1,
      illustration: {
        artId: 'art/1111111113',
        artistId: 'ast/1111111112',
      },
      revealedAt: new Date(),
      publishedAt: new Date(),
      archivedAt: null,
      isSample: false,
    },
  ];
  const collection = firestoreAdmin.collection("cards");
  const batch = firestoreAdmin.batch();
  cards.forEach((card) => {
    const docRef = collection.doc(card.id);
    batch.set(docRef, card);
  });
  
  await batch.commit();
}

// export const getLinks = async () => {
//   const linkSnapshot = await firestoreAdmin.collection("links").get();
//   const documents = linkSnapshot.docs.map((link) => ({
//     url: link.data().url,
//     title: link.data().title,
//     desc: link.data().desc,
//   }));

//   return documents;
// };

// export const getLogo = async () => {
//   const logoSnapshot = await firestoreAdmin.collection("images").doc("logo").get();
//   const logoData = logoSnapshot.data() as { url: string } | undefined;
//   if (!logoSnapshot.exists || !logoData) {
//     return null;
//   }
//   return logoData.url;
// };

// export const getLogoFromStorage = async () => {
//   const bucket = getStorage().bucket();
//   const file = bucket.file("images/logo.png");
//   const imageUrl = await getDownloadURL(file);
//   console.log(imageUrl);
//   return imageUrl;
// };
