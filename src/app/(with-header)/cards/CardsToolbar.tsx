'use client';

import { useState } from 'react';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSField from '@/components/ds/DSField';
import DSSelect from '@/components/ds/DSSelect';
import { CardListAspectFilter, CardListTypeFilter } from '@/lib/cardsList';
import styles from './CardsBrowserClient.module.css';

type Props = Readonly<{
  query: string;
  type: CardListTypeFilter;
  aspect: CardListAspectFilter;
  typeOptions: { label: string; value: CardListTypeFilter }[];
  aspectOptions: { label: string; value: CardListAspectFilter }[];
  onQueryChange: (value: string) => void;
  onTypeChange: (value: CardListTypeFilter) => void;
  onAspectChange: (value: CardListAspectFilter) => void;
  onApply: () => void;
  onClear: () => void;
  disabled?: boolean;
}>;

export default function CardsToolbar({
  query,
  type,
  aspect,
  typeOptions,
  aspectOptions,
  onQueryChange,
  onTypeChange,
  onAspectChange,
  onApply,
  onClear,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);
  const applyAndClose = () => {
    onApply();
    setOpen(false);
  };
  const clearAndClose = () => {
    onClear();
    setOpen(false);
  };

  return (
    <>
      <DSButton
        label="Filters"
        variant="primary"
        disabled={disabled}
        onClick={() => setOpen(true)}
      />
      <DSDialog
        open={open}
        onOpenChange={setOpen}
        onClose={() => setOpen(false)}
        title="Filter cards"
        description="Search by card name or ID, then narrow the archive by type or aspect."
        content={
          <div className={styles.filterContent}>
            <DSField
              label="Search by name"
              value={query}
              onChange={onQueryChange}
              placeholder="Search cards or IDs"
              disabled={disabled}
            />
            <DSSelect
              label="Type"
              options={typeOptions}
              value={type}
              onChange={onTypeChange}
              disabled={disabled}
            />
            <DSSelect
              label="Aspect"
              options={aspectOptions}
              value={aspect}
              onChange={onAspectChange}
              disabled={disabled}
            />
          </div>
        }
        actions={
          <div className={styles.filterActions}>
            <DSButton onClick={clearAndClose} label="Clear" disabled={disabled} variant="ghost" />
            <DSButton onClick={applyAndClose} label="Apply" disabled={disabled} submitOnEnter variant="primary" />
          </div>
        }
      />
    </>
  );
}
