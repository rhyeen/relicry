'use client';

import Link from 'next/link';

export default function PermissionDenied() {
  return (
    <div>
      <h1>401</h1>
      <p>Permission Denied</p>
      <p>You have attempted to access a restricted page. Either you do not have permission to view this page or you need to log into an account with the appropriate permissions.</p>
      <Link href="/">
        Return Home
      </Link>
    </div>
  );
}
