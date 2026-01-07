'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Page Not Found</p>
      <Link href="/">
        Return Home
      </Link>
    </div>
  );
}
