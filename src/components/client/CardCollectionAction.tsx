'use client';

import { useEffect, useMemo, useState } from 'react';
import LoginDialog from '@/components/client/LoginDialog';
import DSActionMenu from '@/components/ds/DSActionMenu';
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSField, { toDateOnlyString } from '@/components/ds/DSField';
import DSFloatingActionButton from '@/components/ds/DSFloatingActionButton';
import {
  CollectionIcon,
  DeckTbdIcon,
  EditDetailsIcon,
  PhysicalCopyIcon,
  RemoveIcon,
  SignOutIcon,
  WarningIcon,
  WishlistIcon,
} from '@/components/ds/DSNavIcons';
import DSNumberField from '@/components/ds/DSNumberField';
import DSSelect from '@/components/ds/DSSelect';
import DSSwitch from '@/components/ds/DSSwitch';
import DSText from '@/components/ds/DSText';
import {
  GradeID,
  GradingCompany,
  PlayerCardCondition,
  PlayerCardDTO,
  PlayerCardLanguage,
  PlayerCardOwnership,
} from '@/entities/PlayerCard';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { signOutUser } from '@/lib/client/signInClient';
import type { PlayerCardMutationResponse, PlayerCardStatusResponse } from '@/lib/playerCardsApi';
import styles from './CardCollectionAction.module.css';

type Props = { cardId: string; cardVersionId: number };

type CollectionError = {
  title: string;
  message: string;
};

type PlayerCardForm = {
  quantity: number;
  ownership: PlayerCardOwnership;
  condition: PlayerCardCondition;
  language: PlayerCardLanguage;
  foiled: boolean;
  signedByIllustrator: boolean;
  signedByAuthor: boolean;
  notes: string;
  acquiredAt: string;
  acquiredFrom: string;
  graded: boolean;
  gradingCompany: GradingCompany;
  grade: number;
  gradeId: GradeID;
};

const ownershipOptions = [
  { label: 'Owned', value: PlayerCardOwnership.Owned },
  { label: 'Wishlist', value: PlayerCardOwnership.WishList },
  { label: 'Looking to buy', value: PlayerCardOwnership.LookingToBuy },
  { label: 'Looking to sell', value: PlayerCardOwnership.LookingToSell },
];

const conditionOptions = [
  { label: 'Mint', value: PlayerCardCondition.Mint },
  { label: 'Near mint', value: PlayerCardCondition.NearMint },
  { label: 'Good', value: PlayerCardCondition.Good },
  { label: 'Light played', value: PlayerCardCondition.LightPlayed },
  { label: 'Heavily played', value: PlayerCardCondition.HeavilyPlayed },
  { label: 'Damaged', value: PlayerCardCondition.Damaged },
];

const languageOptions = [
  { label: 'English', value: PlayerCardLanguage.English },
];

const gradingCompanyOptions = [
  { label: 'PSA', value: GradingCompany.PSA },
  { label: 'BGS', value: GradingCompany.BGS },
  { label: 'SGC', value: GradingCompany.SGC },
];

const gradeIdOptions = [
  { label: GradeID.PSAGEMMT, value: GradeID.PSAGEMMT },
];

export default function CardCollectionAction({ cardId, cardVersionId }: Props) {
  const { user, ready } = useAuthUser();
  const [playerCard, setPlayerCard] = useState<PlayerCardDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState<null | 'save' | 'wishlist' | 'details' | 'remove'>(null);
  const [error, setError] = useState<CollectionError | null>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [form, setForm] = useState<PlayerCardForm>(() => createDefaultForm(PlayerCardOwnership.Owned));
  const [quickQuantity, setQuickQuantity] = useState(1);

  const count = Array.isArray(playerCard?.individuals) ? playerCard.individuals.length : 0;
  const fabTone = error ? 'danger' : playerCard ? 'success' : 'primary';
  const fabLabel = error
    ? 'Collection error'
    : playerCard
      ? `In collection, ${count} saved`
      : 'Save to collection';

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!ready || !user) return;

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const qs = new URLSearchParams({
          cardId,
          cardVersion: String(cardVersionId),
        });
        const res = await fetch(`/api/player-card?${qs}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`GET failed: ${res.status}`);
        const json = await res.json() as PlayerCardStatusResponse;

        if (!cancelled) setPlayerCard(json.playerCard ?? null);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError({
            title: 'Unable to load collection status',
            message: 'Relicry could not confirm whether this card is saved to your collection.',
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [ready, user, cardId, cardVersionId]);

  const trigger = useMemo(() => (
    <DSFloatingActionButton
      badge={playerCard && count > 0 ? count : undefined}
      icon={error ? <WarningIcon /> : <CollectionIcon />}
      label={fabLabel}
      loading={loading}
      tone={fabTone}
    />
  ), [count, error, fabLabel, fabTone, loading, playerCard]);

  const saveForm = async (nextForm: PlayerCardForm, method: 'POST' | 'PATCH' = playerCard ? 'PATCH' : 'POST') => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }

    setWorking('details');
    setError(null);
    try {
      const saved = await savePlayerCard(user, cardId, cardVersionId, nextForm, method);
      setPlayerCard(saved);
      setDetailsOpen(false);
    } catch (e) {
      console.error(e);
      setError({
        title: 'Unable to save collection details',
        message: 'The card was not saved. Try again, or log out and back in if your session has expired.',
      });
      setErrorOpen(true);
    } finally {
      setWorking(null);
    }
  };

  const saveQuickPhysicalCopy = async () => {
    const nextForm = createDefaultForm(PlayerCardOwnership.Owned, quickQuantity);
    setWorking('save');
    try {
      await saveForm(nextForm, 'POST');
    } finally {
      setWorking(null);
    }
  };

  const saveWishlist = async () => {
    setWorking('wishlist');
    try {
      await saveForm(createDefaultForm(PlayerCardOwnership.WishList), 'POST');
    } finally {
      setWorking(null);
    }
  };

  const openDetails = () => {
    setForm(playerCard ? formFromPlayerCard(playerCard) : createDefaultForm(PlayerCardOwnership.Owned, quickQuantity));
    setDetailsOpen(true);
  };

  const removeFromCollection = async () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }

    setWorking('remove');
    setError(null);
    try {
      const token = await user.getIdToken();
      const qs = new URLSearchParams({
        cardId,
        cardVersion: String(cardVersionId),
      });
      const res = await fetch(`/api/player-card?${qs}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
      setPlayerCard(null);
      setQuickQuantity(1);
    } catch (e) {
      console.error(e);
      setError({
        title: 'Unable to remove card',
        message: 'The collection record was not removed. Try again, or log out and back in if your session has expired.',
      });
      setErrorOpen(true);
    } finally {
      setWorking(null);
    }
  };

  if (!ready) {
    return (
      <DSFloatingActionButton
        disabled
        icon={<CollectionIcon />}
        label="Loading collection action"
        loading
        tone="neutral"
      />
    );
  }

  if (!user) {
    return (
      <>
        <DSFloatingActionButton
          icon={<WarningIcon />}
          label="Log in to save this card"
          onClick={() => setLoginPromptOpen(true)}
          tone="warning"
        />
        <LoginRequiredDialog
          open={loginPromptOpen}
          onClose={() => setLoginPromptOpen(false)}
          onLogin={() => {
            setLoginPromptOpen(false);
            setLoginOpen(true);
          }}
        />
        <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <DSFloatingActionButton
          icon={<WarningIcon />}
          label="Review collection error"
          onClick={() => setErrorOpen(true)}
          tone="danger"
        />
        <CollectionErrorDialog
          error={error}
          open={errorOpen}
          onClose={() => setErrorOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <DSActionMenu
        ariaLabel="Collection actions"
        trigger={trigger}
        items={playerCard ? [
          {
            label: 'Edit details',
            icon: <EditDetailsIcon />,
            onClick: openDetails,
          },
          {
            label: 'Remove from collection',
            destructive: true,
            disabled: working === 'remove',
            icon: <RemoveIcon />,
            onClick: removeFromCollection,
          },
          {
            label: 'View collection',
            icon: <CollectionIcon />,
            href: '/collection',
          },
          {
            label: 'Add to deck',
            description: 'Deck building is coming later.',
            disabled: true,
            icon: <DeckTbdIcon />,
          },
        ] : [
          {
            label: 'Wishlist it',
            disabled: working === 'wishlist',
            icon: <WishlistIcon />,
            onClick: saveWishlist,
          },
          {
            label: 'More options',
            icon: <EditDetailsIcon />,
            onClick: openDetails,
          },
        ]}
      >
        {!playerCard ? (
          <div className={styles.quickSave}>
            <DSText.Body className={styles.quickTitle}>Save physical copies</DSText.Body>
            <DSNumberField
              label="Quantity"
              min={1}
              max={99}
              value={quickQuantity}
              onChange={(value) => setQuickQuantity(clampQuantity(value))}
            />
            <DSButton
              icon={<PhysicalCopyIcon />}
              label={working === 'save' ? 'Saving...' : 'Save physical copy'}
              loading={working === 'save'}
              onClick={saveQuickPhysicalCopy}
              variant="primary"
            />
          </div>
        ) : null}
      </DSActionMenu>

      <PlayerCardDetailsDialog
        form={form}
        loading={working === 'details'}
        open={detailsOpen}
        saved={!!playerCard}
        onChange={setForm}
        onClose={() => setDetailsOpen(false)}
        onSave={() => saveForm(form)}
      />
    </>
  );
}

function LoginRequiredDialog({
  onClose,
  onLogin,
  open,
}: Readonly<{
  onClose: () => void;
  onLogin: () => void;
  open: boolean;
}>) {
  return (
    <DSDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onClose={onClose}
      title="Log in to save cards"
      description="Collection records are tied to your Relicry profile."
      content={
        <DSText.Body tone="muted">
          Log in or create an account to save cards to your collection and see them later on your collection page.
        </DSText.Body>
      }
      actions={
        <>
          <DSButton label="Not now" onClick={onClose} variant="ghost" />
          <DSButton label="Log in" onClick={onLogin} variant="primary" />
        </>
      }
    />
  );
}

function CollectionErrorDialog({
  error,
  onClose,
  open,
}: Readonly<{
  error: CollectionError;
  onClose: () => void;
  open: boolean;
}>) {
  const handleSignOut = async () => {
    await signOutUser();
    onClose();
  };

  return (
    <DSDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onClose={onClose}
      title={error.title}
      content={
        <div className={styles.dialogStack}>
          <DSText.Body tone="muted">{error.message}</DSText.Body>
          <DSText.Body tone="muted">
            Refresh the page and try again. If the problem continues, log out and log back in so Relicry can refresh your session.
          </DSText.Body>
        </div>
      }
      actions={
        <>
          <DSButton label="Close" onClick={onClose} variant="ghost" />
          <DSButton icon={<SignOutIcon />} label="Log out" onClick={handleSignOut} variant="secondary" />
        </>
      }
    />
  );
}

function PlayerCardDetailsDialog({
  form,
  loading,
  onChange,
  onClose,
  onSave,
  open,
  saved,
}: Readonly<{
  form: PlayerCardForm;
  loading: boolean;
  onChange: (form: PlayerCardForm) => void;
  onClose: () => void;
  onSave: () => void;
  open: boolean;
  saved: boolean;
}>) {
  const update = <Key extends keyof PlayerCardForm>(key: Key, value: PlayerCardForm[Key]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <DSDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
      onClose={onClose}
      title={saved ? 'Edit collection details' : 'Save collection details'}
      description="These details apply to every copy saved in this update."
      size="wide"
      content={
        <div className={styles.detailsForm}>
          <div className={styles.formGrid}>
            <DSNumberField
              label="Quantity"
              min={1}
              max={99}
              value={form.quantity}
              onChange={(value) => update('quantity', clampQuantity(value))}
              disabled={loading}
            />
            <DSSelect
              label="Ownership"
              options={ownershipOptions}
              value={form.ownership}
              onChange={(value) => update('ownership', value)}
              disabled={loading}
            />
            <DSSelect
              label="Condition"
              options={conditionOptions}
              value={form.condition}
              onChange={(value) => update('condition', value)}
              disabled={loading}
            />
            <DSSelect
              label="Language"
              options={languageOptions}
              value={form.language}
              onChange={(value) => update('language', value)}
              disabled={loading}
            />
            <DSField
              label="Acquired date"
              type="date"
              value={form.acquiredAt}
              onChange={(value) => update('acquiredAt', value)}
              disabled={loading}
            />
            <DSField
              label="Acquired from"
              value={form.acquiredFrom}
              onChange={(value) => update('acquiredFrom', value)}
              placeholder="Event, trade, or note"
              disabled={loading}
            />
          </div>

          <div className={styles.switchGrid}>
            <DSSwitch label="Foiled" checked={form.foiled} onChange={(value) => update('foiled', value)} disabled={loading} />
            <DSSwitch label="Signed by illustrator" checked={form.signedByIllustrator} onChange={(value) => update('signedByIllustrator', value)} disabled={loading} />
            <DSSwitch label="Signed by author" checked={form.signedByAuthor} onChange={(value) => update('signedByAuthor', value)} disabled={loading} />
            <DSSwitch label="Graded" checked={form.graded} onChange={(value) => update('graded', value)} disabled={loading} />
          </div>

          {form.graded ? (
            <div className={styles.formGrid}>
              <DSSelect
                label="Grading company"
                options={gradingCompanyOptions}
                value={form.gradingCompany}
                onChange={(value) => update('gradingCompany', value)}
                disabled={loading}
              />
              <DSNumberField
                label="Grade"
                min={1}
                max={10}
                value={form.grade}
                onChange={(value) => update('grade', value ?? 10)}
                disabled={loading}
              />
              <DSSelect
                label="Grade ID"
                options={gradeIdOptions}
                value={form.gradeId}
                onChange={(value) => update('gradeId', value)}
                disabled={loading}
              />
            </div>
          ) : null}

          <DSField
            label="Notes"
            multiline
            rows={4}
            value={form.notes}
            onChange={(value) => update('notes', value)}
            placeholder="Anything you want to remember about this card"
            disabled={loading}
          />
        </div>
      }
      actions={
        <>
          <DSButton label="Cancel" onClick={onClose} variant="ghost" disabled={loading} />
          <DSButton label={saved ? 'Save details' : 'Save to collection'} onClick={onSave} variant="primary" loading={loading} />
        </>
      }
    />
  );
}

async function savePlayerCard(
  user: NonNullable<ReturnType<typeof useAuthUser>['user']>,
  cardId: string,
  cardVersion: number,
  form: PlayerCardForm,
  method: 'POST' | 'PATCH',
): Promise<PlayerCardDTO> {
  const token = await user.getIdToken();
  const res = await fetch('/api/player-card', {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cardId,
      cardVersion,
      individuals: buildIndividuals(form),
    }),
  });
  if (!res.ok) throw new Error(`${method} failed: ${res.status}`);
  const json = await res.json() as PlayerCardMutationResponse;
  return json.playerCard;
}

function buildIndividuals(form: PlayerCardForm): PlayerCardDTO['individuals'] {
  const graded = form.graded
    ? {
      company: form.gradingCompany,
      grade: form.grade,
      gradeId: form.gradeId,
    }
    : null;

  return Array.from({ length: clampQuantity(form.quantity) }, () => ({
    condition: form.condition,
    language: form.language,
    graded,
    signedByIllustrator: form.signedByIllustrator,
    signedByAuthor: form.signedByAuthor,
    notes: form.notes,
    acquiredAt: form.acquiredAt,
    acquiredFrom: form.acquiredFrom,
    foiled: form.foiled,
    ownership: form.ownership,
  }));
}

function createDefaultForm(
  ownership: PlayerCardOwnership,
  quantity = 1,
): PlayerCardForm {
  return {
    quantity: clampQuantity(quantity),
    ownership,
    condition: PlayerCardCondition.NearMint,
    language: PlayerCardLanguage.English,
    foiled: false,
    signedByIllustrator: false,
    signedByAuthor: false,
    notes: '',
    acquiredAt: toDateOnlyString(new Date()),
    acquiredFrom: '',
    graded: false,
    gradingCompany: GradingCompany.PSA,
    grade: 10,
    gradeId: GradeID.PSAGEMMT,
  };
}

function formFromPlayerCard(playerCard: PlayerCardDTO): PlayerCardForm {
  const [first] = playerCard.individuals;
  if (!first) {
    return createDefaultForm(PlayerCardOwnership.Owned);
  }

  return {
    quantity: clampQuantity(playerCard.individuals.length),
    ownership: first.ownership,
    condition: first.condition,
    language: first.language,
    foiled: first.foiled,
    signedByIllustrator: first.signedByIllustrator,
    signedByAuthor: first.signedByAuthor,
    notes: first.notes,
    acquiredAt: toDateInputString(first.acquiredAt),
    acquiredFrom: first.acquiredFrom,
    graded: !!first.graded,
    gradingCompany: first.graded?.company ?? GradingCompany.PSA,
    grade: first.graded?.grade ?? 10,
    gradeId: first.graded?.gradeId ?? GradeID.PSAGEMMT,
  };
}

function clampQuantity(value: number | null | undefined) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(value ?? 1)));
}

function toDateInputString(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? toDateOnlyString(date) : toDateOnlyString(new Date());
}
