import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getUser } from '@/server/cache/user.cache';
import { connection } from 'next/server';
import DSAvatar from '@/components/ds/DSAvatar';
import DSText from '@/components/ds/DSText';

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
      <DSText.Heading as="h1">User Details</DSText.Heading>
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
      <div style={{ alignItems: 'center', display: 'flex', gap: '1rem' }}>
        <DSAvatar user={user} size="xl" />
        <DSText.Heading as="h2">{user.displayName}</DSText.Heading>
      </div>
      <DSText.Body tone="muted">ID: {user.id}</DSText.Body>
      <DSText.Body tone="muted">Email: {user.email}</DSText.Body>
    </div>
  );
}
