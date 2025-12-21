import "server-only";
import { getDownloadURL, getStorage } from "firebase-admin/storage";
import { firestoreAdmin } from '@/lib/firebaseAdmin';

export const getLinks = async () => {
  const linkSnapshot = await firestoreAdmin.collection("links").get();
  const documents = linkSnapshot.docs.map((link) => ({
    url: link.data().url,
    title: link.data().title,
    desc: link.data().desc,
  }));

  return documents;
};

export const getLogo = async () => {
  const logoSnapshot = await firestoreAdmin.collection("images").doc("logo").get();
  const logoData = logoSnapshot.data() as { url: string } | undefined;
  if (!logoSnapshot.exists || !logoData) {
    return null;
  }
  return logoData.url;
};

export const getLogoFromStorage = async () => {
  const bucket = getStorage().bucket();
  const file = bucket.file("images/logo.png");
  const imageUrl = await getDownloadURL(file);
  console.log(imageUrl);
  return imageUrl;
};
