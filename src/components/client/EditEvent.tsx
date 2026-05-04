"use client";

import { useMemo, useState } from 'react';
import PermissionDenied from '@/app/permission-denied';
import DSButton from '@/components/ds/DSButton';
import DSField, { fromDateOnlyString, toDateOnlyString } from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';
import DSSection from '@/components/ds/DSSection';
import DSSwitch from '@/components/ds/DSSwitch';
import DSToggleGroup from '@/components/ds/DSToggleGroup';
import { AdminRole, hasRole } from '@/entities/AdminRole';
import { Event } from '@/entities/Event';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useUser } from '@/lib/client/useUser';
import { useRouter } from 'next/navigation';

type EditEventProps = Readonly<{
  event?: Event;
  rewardLevels?: number[];
}>;

const rewardLevelOptions = [1, 2, 3].map((level) => ({
  label: `Level ${level}`,
  value: `${level}`,
}));

function getDefaultNewEvent(): Event {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  return {
    id: '',
    title: '',
    description: '',
    running: {
      from: now,
      to: tomorrow,
    },
    createdAt: now,
    updatedAt: now,
    archivedAt: null,
  };
}

export default function EditEvent({ event: initEvent, rewardLevels: initRewardLevels }: EditEventProps) {
  const editorKey = useMemo(() => initEvent?.id ?? 'new', [initEvent?.id]);
  const { user, ready } = useUser();

  if (!ready) {
    return null;
  }

  if (!hasRole(user?.adminRoles, AdminRole.EventAdmin)) {
    return PermissionDenied();
  }

  return <EditEventInner key={editorKey} initEvent={initEvent} initRewardLevels={initRewardLevels} />;
}

function EditEventInner({ initEvent, initRewardLevels }: { initEvent?: Event; initRewardLevels?: number[] }) {
  const authUser = useAuthUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [event, setEvent] = useState<Event>(() => initEvent ?? getDefaultNewEvent());
  const [rewardLevels, setRewardLevels] = useState<string[]>(() =>
    (initRewardLevels ?? []).map((level) => `${level}`).sort()
  );

  const getTitleError = (): string | undefined => {
    if (!event.title.trim()) {
      return 'Title is required.';
    }
    return undefined;
  };

  const getDescriptionError = (): string | undefined => {
    if (!event.description.trim()) {
      return 'Description is required.';
    }
    return undefined;
  };

  const getRunningError = (): string | undefined => {
    if (!(event.running.from instanceof Date) || Number.isNaN(event.running.from.getTime())) {
      return 'Running from date is required.';
    }
    if (!(event.running.to instanceof Date) || Number.isNaN(event.running.to.getTime())) {
      return 'Running to date is required.';
    }
    if (event.running.to < event.running.from) {
      return 'Running to date must be on or after the start date.';
    }
    return undefined;
  };

  const getEventIdError = (): string | undefined => {
    let _eventId = event.id;
    if (_eventId.startsWith('e/')) {
      _eventId = _eventId.slice(2);
    }
    if (!_eventId.trim()) {
      return 'Event ID is required.';
    }
    if (!/^[a-z0-9]+$/.test(_eventId)) {
      return 'Event ID can only contain lowercase letters and numbers.';
    }
    return undefined;
  };

  const onCancel = () => {
    if (event.id) {
      router.push(`/${event.id}`);
      return;
    }
    router.push('/events');
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = (
      !!getTitleError() ||
      !!getDescriptionError() ||
      !!getRunningError() ||
      !!getEventIdError()
    );
    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      let eventId = event.id.trim() ? event.id.trim() : undefined;
      if (eventId && !eventId.startsWith('e/')) {
        eventId = `e/${eventId}`;
      }
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          event: {
            ...event,
            id: eventId,
            title: event.title.trim(),
            description: event.description.trim(),
            running: {
              from: new Date(event.running.from),
              to: new Date(event.running.to),
            },
            archivedAt: event.archivedAt ? new Date(event.archivedAt) : null,
          },
          rewardLevels: rewardLevels
            .map((level) => Number.parseInt(level, 10))
            .filter((level) => Number.isInteger(level))
            .sort((a, b) => a - b),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const savedEvent = json.event as Event;
      router.push(`/${savedEvent.id}`);
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? 'Failed to save.');
    } finally {
      setLoading(false);
    }
  };

  const fixEventIdFormatting = (id: string): string => {
    return id.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm>
        <DSForm.Title>{event.id ? 'Edit Event' : 'New Event'}</DSForm.Title>
        <DSForm.Description>
          Create or update a scheduled event.
        </DSForm.Description>

        <DSField
          label="Event ID"
          value={event.id}
          onChange={(value) => setEvent((current) => ({ ...current, id: fixEventIdFormatting(value) }))}
          placeholder="Generate a unique ID for this event (e.g. 'summer2024')."
          readonly={!!initEvent?.id}
          error={saveAttempted ? getEventIdError() : undefined}
          required
        />

        <DSField
          label="Title"
          value={event.title}
          onChange={(value) => setEvent((current) => ({ ...current, title: value }))}
          error={saveAttempted ? getTitleError() : undefined}
          required
        />

        <DSField
          label="Description"
          value={event.description}
          onChange={(value) => setEvent((current) => ({ ...current, description: value }))}
          error={saveAttempted ? getDescriptionError() : undefined}
          required
          multiline
          rows={5}
        />

        <DSField
          label="Running From"
          type="date"
          value={toDateOnlyString(event.running.from)}
          onChange={(value) => {
            const nextFrom = fromDateOnlyString(value) ?? new Date();
            setEvent((current) => ({
              ...current,
              running: {
                ...current.running,
                from: nextFrom,
              },
            }));
          }}
          error={saveAttempted ? getRunningError() : undefined}
          required
        />

        <DSField
          label="Running To"
          type="date"
          value={toDateOnlyString(event.running.to)}
          onChange={(value) => {
            const nextTo = fromDateOnlyString(value) ?? new Date();
            setEvent((current) => ({
              ...current,
              running: {
                ...current.running,
                to: nextTo,
              },
            }));
          }}
          error={saveAttempted ? getRunningError() : undefined}
          required
        />

        <DSToggleGroup.Text
          label="Reward Levels"
          description="Choose which reward levels this event should have."
          options={rewardLevelOptions}
          multiple
          values={rewardLevels}
          onChange={(values: string[]) => setRewardLevels([...values].sort())}
        />

        <DSSwitch
          label="Archived?"
          checked={event.archivedAt !== null}
          onChange={(value) => setEvent((current) => ({ ...current, archivedAt: value ? new Date() : null }))}
        />

        {event.archivedAt && (
          <DSField
            label="Archived At"
            type="date"
            value={toDateOnlyString(event.archivedAt)}
            onChange={(value) => setEvent((current) => ({
              ...current,
              archivedAt: fromDateOnlyString(value) ?? new Date(),
            }))}
          />
        )}

        <DSForm.ButtonGroup>
          <DSButton onClick={onSave} label="Save Event" loading={loading} disabled={!authUser.ready} />
          <DSButton onClick={onCancel} label="Cancel" loading={loading} />
        </DSForm.ButtonGroup>
      </DSForm>
    </DSSection>
  );
}
