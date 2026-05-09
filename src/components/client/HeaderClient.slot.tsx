'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import DSSpinner from '@/components/ds/DSSpinner';
import styles from './HeaderClient.module.css';

const Client = dynamic(() => import('@/components/client/HeaderClient'), {
  ssr: false,
  loading: () => (
    <div className={styles.userContainer}>
      <span className={styles.loadingIndicator}>
        <DSSpinner size="sm" label="Loading account" />
      </span>
    </div>
  ),
});

export type Props = React.ComponentProps<typeof Client>;

export default function HeaderClientSlot(props: Props) {
  return <Client {...props} />;
}
