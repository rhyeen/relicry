import { firestoreAdmin } from '@/lib/firebaseAdmin';
import { User } from '@/entities/User';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { UserDB } from '@/server/db/user.db';

type Params = { id: string };

const getUser = cache(async (id: string): Promise<User | null> => {
  return new UserDB(firestoreAdmin).getFromParts(id);
});

export async function generateMetadata(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) {
    return {
      title: 'User Not Found',
      description: 'The requested user does not exist.',
    };
  }

  return {
    title: `${user.displayName} • Relicry`,
    description: `Profile of ${user.displayName}.`,
  };
}

export default async function UserPage(
  { params }: { params: Promise<Params> }
) {
  const { id } = await params;
  const user = await getUser(id);

  if (!user) notFound();

  return (
    <div>
      <h1>{user.displayName}</h1>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}