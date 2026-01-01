import { cacheLife } from 'next/cache';

export default async function FooterYear() {
  'use cache';
  cacheLife('noChange');

  return <>{new Date().getFullYear()}</>;
}