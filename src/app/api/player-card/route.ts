import 'server-only';

import { NextResponse } from 'next/server';
import { firestoreAdmin, appAdmin } from '@/lib/firebaseAdmin';
import { getUserId } from '@/entities/User';
import {
  PlayerCardCondition,
  PlayerCardOwnership,
  getPlayerCardId,
} from '@/entities/PlayerCard';

function defaultIndividual(userId: string) {
  const now = new Date();
  return {
    condition: PlayerCardCondition.NearMint,
    signedByIllustrator: false,
    signedByAuthor: false,
    notes: '',
    acquiredAt: now,
    acquiredFrom: userId,
    foiled: false,
    ownership: PlayerCardOwnership.Owned,
  };
}

async function requireUid(req: Request): Promise<string> {
  const authHeader = req.headers.get('authorization') || '';
  const m = authHeader.match(/^Bearer (.+)$/);
  if (!m) throw new Error('Missing Authorization header');

  const idToken = m[1]!;
  const decoded = await appAdmin.auth().verifyIdToken(idToken);
  return decoded.uid;
}

export async function GET(req: Request) {
  try {
    const uid = await requireUid(req);
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');
    const cardVersion = Number(searchParams.get('cardVersion'));

    if (!cardId || !Number.isFinite(cardVersion)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const storedUserId = getUserId(uid);
    const docId = getPlayerCardId(storedUserId, cardId, cardVersion);

    const ref = firestoreAdmin.collection('playerCards').doc(docId);
    const snap = await ref.get();
    if (!snap.exists) return NextResponse.json({ playerCard: null });

    const data = snap.data()!;
    return NextResponse.json({ playerCard: data });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const uid = await requireUid(req);
    const body = await req.json();
    const cardId = body?.cardId as string | undefined;
    const cardVersion = Number(body?.cardVersion);

    if (!cardId || !Number.isFinite(cardVersion)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    }

    const storedUserId = getUserId(uid);
    const docId = getPlayerCardId(storedUserId, cardId, cardVersion);

    const ref = firestoreAdmin.collection('playerCards').doc(docId);
    const snap = await ref.get();
    const now = new Date();

    if (!snap.exists) {
      const data = {
        id: docId,
        userId: storedUserId,
        cardId,
        cardVersion,
        individuals: [defaultIndividual(storedUserId)],
        createdAt: now,
        updatedAt: now,
      };
      await ref.set(data);
      return NextResponse.json({ playerCard: data });
    }

    const existing = snap.data()!;
    const individuals = Array.isArray(existing.individuals) ? existing.individuals : [];
    individuals.push(defaultIndividual(storedUserId));

    await ref.update({ individuals, updatedAt: now });
    return NextResponse.json({ playerCard: { ...existing, individuals, updatedAt: now } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
