'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/RewardUniqueRewardsManager'), {
  ssr: false,
  loading: () => <div>Loading unique rewards...</div>,
});

export type Props = React.ComponentProps<typeof Client>;

export default function RewardUniqueRewardsManagerSlot(props: Props) {
  return <Client {...props} />;
}
