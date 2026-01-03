'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/HeaderClient'), {
  ssr: false,
  loading: () => <div>Loading image...</div>,
});

export type Props = React.ComponentProps<typeof Client>;

export default function HeaderClientSlot(props: Props) {
  return <Client {...props} />;
}