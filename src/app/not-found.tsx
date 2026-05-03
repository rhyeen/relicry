'use client';

import DSText from '@/components/ds/DSText';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <DSText.Heading as="h1">404</DSText.Heading>
      <DSText.Body tone="muted">Page Not Found</DSText.Body>
      <Link href="/">
        Return Home
      </Link>
    </div>
  );
}
