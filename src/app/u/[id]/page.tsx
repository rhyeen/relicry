import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getUser } from '@/server/cache/user.cache';
import { connection } from 'next/server';

type Params = { id: string };

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
  return (
    <div>
      <h1>User Details</h1>
      <Suspense fallback={<div>Loading user data...</div>}>
        <UserPageData params={params} />
      </Suspense>
    </div>
  );
}

async function UserPageData(
  { params }: { params: Promise<Params> }
) {
  await connection();
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
