import "server-only";
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { Card } from '@/entities/Card';
import { isEmulated } from '@/lib/environment';

export const populateLocal = async () => {
  if (!isEmulated) {
    return;
  }

  const cards: Card[] = [
    { id: "abcdef", version: 1, drawLimit: 5 },
    { id: "aaaaaa", version: 1, drawLimit: 3 },
    { id: "123456", version: 2, drawLimit: 4 },
  ];
  const collection = firestoreAdmin.collection("cards");
  const batch = firestoreAdmin.batch();
  cards.forEach((card) => {
    const docRef = collection.doc(card.id);
    batch.set(docRef, card);
  });
  
  await batch.commit();
};

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
