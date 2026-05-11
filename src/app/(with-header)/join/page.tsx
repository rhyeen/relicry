import type { Metadata } from 'next';
import JoinClient from './JoinClient';

export const metadata: Metadata = {
  title: 'Join Relicry',
  description: 'Create your Relicry account and use your profile QR at events.',
};

export default function JoinPage() {
  return <JoinClient />;
}
