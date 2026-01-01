'use client';

import dynamic from 'next/dynamic';

const HeaderClient = dynamic(() => import('@/components/client/HeaderClient'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function HeaderClientSlot() {
  return <HeaderClient />;
}
