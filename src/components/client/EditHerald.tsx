"use client";

import { useEffect, useMemo, useState } from 'react';
import PermissionDenied from '@/app/permission-denied';
import DSButton from '@/components/ds/DSButton';
import DSField, { fromDateOnlyString, toDateOnlyString } from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import DSSelect from '@/components/ds/DSSelect';
import DSSwitch from '@/components/ds/DSSwitch';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { Herald } from '@/entities/Herald';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import type { HeraldEditorOptions } from '@/server/heralds';
import { useRouter } from 'next/navigation';

type EditHeraldProps = Readonly<{
  herald?: Herald;
  options?: HeraldEditorOptions;
}>;

function getDefaultNewHerald(): Herald {
  const now = new Date();

  return {
    id: '',
    userId: '',
    artistId: null,
    eventId: '',
    override: {},
    mapPin: {
      id: 'NOT_SET',
      x: 0,
      y: 0,
    },
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
}

export default function EditHerald({ herald: initHerald, options: initOptions }: EditHeraldProps) {
  const editorKey = useMemo(() => initHerald?.id ?? 'new', [initHerald?.id]);
  const { user, ready } = useUser();

  if (!ready) {
    return null;
  }

  if (!hasRole(user?.adminRoles, AdminRole.EventAdmin)) {
    return PermissionDenied();
  }

  return <EditHeraldInner key={editorKey} initHerald={initHerald} initOptions={initOptions} />;
}

function EditHeraldInner({
  initHerald,
  initOptions,
}: {
  initHerald?: Herald;
  initOptions?: HeraldEditorOptions;
}) {
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [herald, setHerald] = useState<Herald>(() => normalizeHerald(initHerald ?? getDefaultNewHerald()));
  const [promotedItemIds, setPromotedItemIds] = useState(() =>
    (initHerald?.override.promotedItemIds ?? []).join('\n')
  );
  const [hasLimitedTime, setHasLimitedTime] = useState(() => !!initHerald?.limitedTimeAtEvent);
  const [options, setOptions] = useState<HeraldEditorOptions | null>(() =>
    initOptions ? normalizeOptions(initOptions) : null
  );

  useEffect(() => {
    if (options || !authUser.ready || !authUser.user) return;

    let cancelled = false;
    const currentUser = authUser.user;

    const loadOptions = async () => {
      setLoading(true);
      setSaveError(null);
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/admin/heralds?options=1', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.error || json?.details || `Load failed (${res.status})`);
        }
        if (!cancelled) {
          setOptions(normalizeOptions(json.options as HeraldEditorOptions));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setSaveError((err as Error)?.message ?? 'Failed to load herald options.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [authUser.ready, authUser.user, options]);

  if (!options) {
    return (
      <DSSection>
        <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
        <DSSection.Card>
          Loading herald options...
        </DSSection.Card>
      </DSSection>
    );
  }

  const selectedEvent = options.events.find((event) => event.value === herald.eventId) ?? null;

  const getUserError = (): string | undefined => {
    if (!herald.userId) return 'User is required.';
    return undefined;
  };

  const getEventError = (): string | undefined => {
    if (!herald.eventId) return 'Event is required.';
    return undefined;
  };

  const getLimitedTimeError = (): string | undefined => {
    if (!hasLimitedTime) return undefined;
    if (!selectedEvent) return 'Choose an event before setting limited dates.';
    const limitedTime = herald.limitedTimeAtEvent;
    if (!limitedTime?.from || !limitedTime.to) return 'Both limited dates are required.';
    if (limitedTime.to < limitedTime.from) return 'Limited to date must be on or after from date.';
    if (limitedTime.from < selectedEvent.running.from || limitedTime.to > selectedEvent.running.to) {
      return 'Limited dates must be within the event dates.';
    }
    return undefined;
  };

  const getFinalHerald = (): Herald => {
    const itemIds = promotedItemIds
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean);

    return {
      ...herald,
      artistId: herald.artistId || null,
      override: {
        name: herald.override.name?.trim() || undefined,
        profileImageUrl: herald.override.profileImageUrl?.trim() || undefined,
        bannerImageUrl: herald.override.bannerImageUrl?.trim() || undefined,
        summary: herald.override.summary?.trim() || undefined,
        promotedItemIds: itemIds.length > 0 ? [...new Set(itemIds)] : undefined,
      },
      mapPin: {
        id: 'NOT_SET',
        x: 0,
        y: 0,
      },
      limitedTimeAtEvent: hasLimitedTime ? herald.limitedTimeAtEvent : undefined,
      archivedAt: herald.archivedAt ? new Date(herald.archivedAt) : null,
    };
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = !!getUserError() || !!getEventError() || !!getLimitedTimeError();
    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch('/api/admin/heralds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ herald: getFinalHerald() }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const savedHerald = json.herald as Herald;
      router.push(`/${savedHerald.id}`);
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    if (herald.id) {
      router.push(`/${herald.id}`);
      return;
    }
    router.push('/heralds');
  };

  const setLimitedFrom = (value: string) => {
    const nextFrom = fromDateOnlyString(value) ?? selectedEvent?.running.from ?? new Date();
    setHerald((current) => ({
      ...current,
      limitedTimeAtEvent: {
        from: nextFrom,
        to: current.limitedTimeAtEvent?.to ?? selectedEvent?.running.to ?? nextFrom,
      },
    }));
  };

  const setLimitedTo = (value: string) => {
    const nextTo = fromDateOnlyString(value) ?? selectedEvent?.running.to ?? new Date();
    setHerald((current) => ({
      ...current,
      limitedTimeAtEvent: {
        from: current.limitedTimeAtEvent?.from ?? selectedEvent?.running.from ?? nextTo,
        to: nextTo,
      },
    }));
  };

  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm>
        <DSForm.Title>{herald.id ? 'Edit Herald' : 'New Herald'}</DSForm.Title>
        <DSForm.Description>
          Heralds are event vendors or hosts. They must be existing users, and artist-linked fields are inherited unless overridden here.
        </DSForm.Description>

        <DSField
          label="Herald ID"
          value={herald.id}
          onChange={(value) => setHerald((current) => ({ ...current, id: value }))}
          placeholder="Will be generated for new heralds"
          readonly
        />

        <DSSelect
          label="User"
          value={herald.userId || undefined}
          options={options.users}
          onChange={(value) => setHerald((current) => ({ ...current, userId: value }))}
          placeholder="Choose an existing user"
          required
          error={saveAttempted ? getUserError() : undefined}
        />

        <DSSelect
          label="Event"
          value={herald.eventId || undefined}
          options={options.events}
          onChange={(value) => setHerald((current) => ({
            ...current,
            eventId: value,
            limitedTimeAtEvent: current.limitedTimeAtEvent ?? {
              from: options.events.find((event) => event.value === value)?.running.from ?? new Date(),
              to: options.events.find((event) => event.value === value)?.running.to ?? new Date(),
            },
          }))}
          placeholder="Choose an event"
          required
          error={saveAttempted ? getEventError() : undefined}
        />

        <DSSelect
          label="Artist"
          value={herald.artistId}
          options={[{ label: 'No artist link', value: null }, ...options.artists]}
          onChange={(value) => setHerald((current) => ({ ...current, artistId: value }))}
          description="Artist banner, summary, and promoted items are inherited unless overridden below."
        />

        <DSSwitch
          label="Only available for part of the event?"
          checked={hasLimitedTime}
          onChange={(value) => {
            setHasLimitedTime(value);
            if (value && !herald.limitedTimeAtEvent) {
              setHerald((current) => ({
                ...current,
                limitedTimeAtEvent: {
                  from: selectedEvent?.running.from ?? new Date(),
                  to: selectedEvent?.running.to ?? new Date(),
                },
              }));
            }
          }}
        />

        {hasLimitedTime && (
          <>
            <DSField
              label="Available From"
              type="date"
              value={toDateOnlyString(herald.limitedTimeAtEvent?.from ?? selectedEvent?.running.from ?? new Date())}
              onChange={setLimitedFrom}
              error={saveAttempted ? getLimitedTimeError() : undefined}
              required
            />
            <DSField
              label="Available To"
              type="date"
              value={toDateOnlyString(herald.limitedTimeAtEvent?.to ?? selectedEvent?.running.to ?? new Date())}
              onChange={setLimitedTo}
              error={saveAttempted ? getLimitedTimeError() : undefined}
              required
            />
          </>
        )}

        <DSField
          label="Override Name"
          value={herald.override.name ?? ''}
          onChange={(value) => setHerald((current) => ({
            ...current,
            override: { ...current.override, name: value },
          }))}
          placeholder="Defaults to the user's display name"
        />

        <DSField
          label="Override Profile Image URL"
          type="url"
          value={herald.override.profileImageUrl ?? ''}
          onChange={(value) => setHerald((current) => ({
            ...current,
            override: { ...current.override, profileImageUrl: value },
          }))}
          placeholder="Defaults to the user's profile image"
        />

        <DSField
          label="Override Banner Image URL"
          type="url"
          value={herald.override.bannerImageUrl ?? ''}
          onChange={(value) => setHerald((current) => ({
            ...current,
            override: { ...current.override, bannerImageUrl: value },
          }))}
          placeholder="Defaults to the linked artist banner"
        />

        <DSField
          label="Override Summary"
          value={herald.override.summary ?? ''}
          onChange={(value) => setHerald((current) => ({
            ...current,
            override: { ...current.override, summary: value },
          }))}
          placeholder="Defaults to the linked artist summary"
          multiline
          rows={4}
        />

        <DSField
          label="Override Promoted Item IDs"
          value={promotedItemIds}
          onChange={setPromotedItemIds}
          placeholder="One promoted item ID per line"
          multiline
          rows={4}
        />

        <DSSwitch
          label="Archived?"
          checked={herald.archivedAt !== null}
          onChange={(value) => setHerald((current) => ({ ...current, archivedAt: value ? new Date() : null }))}
        />

        {herald.archivedAt && (
          <DSField
            label="Archived At"
            type="date"
            value={toDateOnlyString(herald.archivedAt)}
            onChange={(value) => setHerald((current) => ({
              ...current,
              archivedAt: fromDateOnlyString(value) ?? new Date(),
            }))}
          />
        )}

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save Herald" loading={loading} disabled={!authUser.ready} />
          <DSButton onClick={onCancel} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}

function normalizeHerald(herald: Herald): Herald {
  return {
    ...herald,
    createdAt: coerceDate(herald.createdAt) ?? new Date(),
    updatedAt: coerceDate(herald.updatedAt) ?? new Date(),
    archivedAt: herald.archivedAt ? coerceDate(herald.archivedAt) : null,
    limitedTimeAtEvent: herald.limitedTimeAtEvent ? {
      from: coerceDate(herald.limitedTimeAtEvent.from) ?? new Date(),
      to: coerceDate(herald.limitedTimeAtEvent.to) ?? new Date(),
    } : undefined,
  };
}

function normalizeOptions(options: HeraldEditorOptions): HeraldEditorOptions {
  return {
    ...options,
    events: options.events.map((event) => ({
      ...event,
      running: {
        from: coerceDate(event.running.from) ?? new Date(),
        to: coerceDate(event.running.to) ?? new Date(),
      },
    })),
  };
}

function coerceDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
