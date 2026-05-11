import type { Metadata } from 'next';
import ProfileClient from './ProfileClient';

export const metadata: Metadata = {
  title: 'Profile • Relicry',
  description: 'Manage your Relicry profile and starter deck records.',
};

export default function ProfilePage() {
  return <ProfileClient />;
}
