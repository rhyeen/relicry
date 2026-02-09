'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/StoredImage'), {
  ssr: false,
  loading: () => <div>Loading image...</div>,
});

export type Props = React.ComponentProps<typeof Client>;

export default function StoredImageSlot(props: Props) {
  return <Client {...props} />;
}