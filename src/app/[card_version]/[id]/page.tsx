import { Card } from '@/entities/Card';
import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { notFound } from 'next/navigation';

async function getCard(card_version: string, id: string): Promise<Card | null> {
  const doc = await firestoreAdmin.collection('cards').doc(id).get();
  if (!doc.exists) {
    return null;
  }
  const card = doc.data() as Card;
  if (card.version?.toString() !== card_version) {
    return null;
  }
  return card;
}

export default async function CardPage({ params }: { params: Promise<{ card_version: string; id: string }> }) {
  const { card_version, id } = await params;

  const card = await getCard(card_version, id);

  if (!card) {
    notFound();
  }

  return (
    <div>
      <h1>Card Details</h1>
      <p>ID: {card.id}</p>
      <p>Version: {card.version}</p>
      <p>Draw Limit: {card.drawLimit}</p>
    </div>
  );
}
