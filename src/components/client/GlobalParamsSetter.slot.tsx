'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const Client = dynamic(() => import('@/components/client/GlobalParamsSetter'), {
  ssr: false,
  loading: () => null,
});

export type Props = React.ComponentProps<typeof Client>;

export default function GlobalParamsSetterSlot(props: Props) {
  return <Client {...props} />;
}