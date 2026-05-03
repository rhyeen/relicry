'use client';

import DSText from '@/components/ds/DSText';
import Link from 'next/link';

export default function PermissionDenied() {
  return (
    <div>
      <DSText.Heading as="h1">401</DSText.Heading>
      <DSText.Body tone="muted">Permission Denied</DSText.Body>
      <DSText.Body tone="muted">
        You have attempted to access a restricted page. Either you do not have permission to view this page or you need to log into an account with the appropriate permissions.
      </DSText.Body>
      <Link href="/">
        Return Home
      </Link>
    </div>
  );
}
