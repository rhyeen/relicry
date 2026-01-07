'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/CardCollectionAction'), {
  ssr: false,
  loading: () => <div>Loading collection...</div>,
});

export type Props = React.ComponentProps<typeof Client>;

export default function CardCollectionActionSlot(props: Props) {
  return <Client {...props} />;
}