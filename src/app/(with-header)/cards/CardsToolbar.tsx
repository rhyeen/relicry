'use client';

import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSSection from '@/components/ds/DSSection';
import DSSelect from '@/components/ds/DSSelect';
import { CardListAspectFilter, CardListTypeFilter } from '@/lib/cardsList';
import {
  buildDownloadUnpublishedRedirectHref,
  DOWNLOAD_UNPUBLISHED_HISTORY_STORAGE_KEY,
  isLocalHostname,
} from '@/lib/unpublishedDownload';
import { useSyncExternalStore } from 'react';

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
  const isLocal = useSyncExternalStore(
    () => () => undefined,
    () => isLocalHostname(window.location.hostname),
    () => false,
  );

  const handleDownloadUnpublished = () => {
    window.localStorage.removeItem(DOWNLOAD_UNPUBLISHED_HISTORY_STORAGE_KEY);
    window.location.assign(buildDownloadUnpublishedRedirectHref());
  };

  return (
    <DSSection.Card background="dark" padding="normal">
      <DSSection.Grid columns={4}>
        <DSField
          label="Search by name"
          value={query}
          onChange={onQueryChange}
          placeholder="Search cards"
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
        <DSSection.Actions>
          {isLocal && (
            <DSButton
              onClick={handleDownloadUnpublished}
              label="Download Unpublished"
            />
          )}
          <DSButton onClick={onApply} label="Apply" disabled={disabled} />
          <DSButton onClick={onClear} label="Clear" disabled={disabled} />
        </DSSection.Actions>
      </DSSection.Grid>
    </DSSection.Card>
  );
}
