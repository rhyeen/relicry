'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/EditQuest'), {
  ssr: false,
  loading: () => <div>Loading form...</div>,
});

export type Props = React.ComponentProps<typeof Client>;

export default function EditQuestSlot(props: Props) {
  return <Client {...props} />;
}
