'use client';

import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSSelect from '@/components/ds/DSSelect';
import { buildCardsQueryString, CardListAspectFilter, CardListFilters, CardListTypeFilter } from '@/lib/cardsList';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

type Props = Readonly<{
  filters: CardListFilters;
  typeOptions: { label: string; value: CardListTypeFilter }[];
  aspectOptions: { label: string; value: CardListAspectFilter }[];
}>;

export default function CardsToolbar({ filters, typeOptions, aspectOptions }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(filters.query);
  const [type, setType] = useState<CardListTypeFilter>(filters.type);
  const [aspect, setAspect] = useState<CardListAspectFilter>(filters.aspect);

  const applyFilters = () => {
    router.push(`/cards${buildCardsQueryString({
      query,
      type,
      aspect,
      page: 1,
    })}`);
  };

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setAspect('all');
    router.push('/cards');
  };

  return (
    <div className={styles.toolbar}>
      <DSField
        label="Search by name"
        value={query}
        onChange={setQuery}
        placeholder="Search cards"
      />
      <DSSelect
        label="Type"
        options={typeOptions}
        value={type}
        onChange={setType}
      />
      <DSSelect
        label="Focus"
        options={aspectOptions}
        value={aspect}
        onChange={setAspect}
      />
      <div className={styles.toolbarActions}>
        <DSButton onClick={applyFilters} label="Apply" />
        <DSButton onClick={clearFilters} label="Clear" />
      </div>
    </div>
  );
}
