"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DSButton from "@/components/ds/DSButton";
import DSField from "@/components/ds/DSField";
import DSForm from "@/components/ds/DSForm";
import DSLoadingOverlay from "@/components/ds/DSLoadingOverlay";
import DSSection from "@/components/ds/DSSection";
import DSSelect from "@/components/ds/DSSelect";
import { AdminRole, hasRole } from "@/entities/AdminRole";
import { Faction } from "@/entities/Faction";
import {
  defaultQuestTokenIdFactions,
  definedQuestTokenIds,
  definedRawQuestTokenIdsEn,
  extractTokenRawId,
  getTokenId,
  QuestToken,
  VersionedQuest,
} from "@/entities/Quest";
import PermissionDenied from "@/app/permission-denied";
import { useAuthUser } from "@/lib/client/useAuthUser";
import { useUser } from "@/lib/client/useUser";

const CURRENT_SEASON = 1;

type EditableQuestToken = {
  id: string;
  faction: Faction;
};

type EditQuestProps = Readonly<{
  quest?: VersionedQuest;
  questTokens?: QuestToken[];
}>;

const factionOptions = [
  { label: "Ironband Guild", value: Faction.IronbandGuild },
  { label: "Nightglass & Co.", value: Faction.NightglassCo },
  { label: "Bridlewild Kin", value: Faction.BridlewildKin },
  { label: "Ordo Aether", value: Faction.OrdoAether },
];

const tokenCountOptions = [1, 2, 3, 4, 5].map((value) => ({ label: `${value}`, value }));

function getDefaultNewQuest(): VersionedQuest {
  return {
    id: "",
    faction: Faction.IronbandGuild,
    level: 1,
    season: CURRENT_SEASON,
    revealed: { at: new Date() },
  };
}

function getDefaultTokenIdsForFaction(faction: Faction): string[] {
  const preferred = Object.entries(defaultQuestTokenIdFactions)
    .filter(([, tokenFaction]) => tokenFaction === faction)
    .map(([rawId]) => getTokenId(rawId));
  const unique: string[] = [];
  for (const id of [...preferred, ...definedQuestTokenIds]) {
    if (!unique.includes(id)) unique.push(id);
    if (unique.length === 3) break;
  }
  return unique;
}

function getDefaultTokensForFaction(faction: Faction): EditableQuestToken[] {
  return getDefaultTokenIdsForFaction(faction).map((id) => ({ id, faction }));
}

function withTokenCount(
  current: EditableQuestToken[],
  nextCount: number,
  questFaction: Faction,
): EditableQuestToken[] {
  if (nextCount <= current.length) return current.slice(0, nextCount);
  const out = [...current];
  const used = new Set(out.map((t) => t.id));
  const defaults = getDefaultTokensForFaction(questFaction);
  for (const token of [...defaults, ...definedQuestTokenIds.map((id) => ({ id, faction: questFaction }))]) {
    if (!used.has(token.id)) {
      out.push(token);
      used.add(token.id);
    }
    if (out.length === nextCount) break;
  }
  return out.slice(0, nextCount);
}

function getInitialTokens(quest: VersionedQuest, questTokens?: QuestToken[]): EditableQuestToken[] {
  if (questTokens && questTokens.length > 0) {
    return questTokens.slice(0, 5).map((token) => ({
      id: token.id,
      faction: token.faction,
    }));
  }
  return getDefaultTokensForFaction(quest.faction);
}

function getTokenOptions() {
  return definedQuestTokenIds.map((tokenId) => {
    const rawId = extractTokenRawId(tokenId);
    const name = definedRawQuestTokenIdsEn[rawId] ?? `Token ${rawId}`;
    return {
      label: `${name} (${tokenId})`,
      value: tokenId,
    };
  });
}

export default function EditQuest({ quest: initQuest, questTokens: initQuestTokens }: EditQuestProps) {
  const editorKey = useMemo(() => {
    if (initQuest?.id) return `${initQuest.id}:${initQuest.season}`;
    return "new";
  }, [initQuest?.id, initQuest?.season]);
  const { user, ready } = useUser();
  if (!ready) {
    return null;
  }
  if (!hasRole(user?.adminRoles, AdminRole.SuperAdmin)) {
    return PermissionDenied();
  }
  return <EditQuestInner key={editorKey} initQuest={initQuest} initQuestTokens={initQuestTokens} />;
}

function EditQuestInner({
  initQuest,
  initQuestTokens,
}: {
  initQuest?: VersionedQuest;
  initQuestTokens?: QuestToken[];
}) {
  const authUser = useAuthUser();
  const router = useRouter();
  const tokenOptions = useMemo(() => getTokenOptions(), []);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveAttempted, setSaveAttempted] = useState(false);
  const [quest, setQuest] = useState<VersionedQuest>(() => initQuest ?? getDefaultNewQuest());
  const [questTokens, setQuestTokens] = useState<EditableQuestToken[]>(() =>
    getInitialTokens(initQuest ?? getDefaultNewQuest(), initQuestTokens),
  );

  const getTokensError = (): string | undefined => {
    if (questTokens.length < 1 || questTokens.length > 5) return "Quest must have between 1 and 5 tokens.";
    const uniqueCount = new Set(questTokens.map((token) => token.id)).size;
    if (uniqueCount !== questTokens.length) return "Quest tokens must be unique.";
    return undefined;
  };

  const getLevelError = (): string | undefined => {
    if (!Number.isInteger(quest.level) || quest.level < 1) return "Level must be a whole number >= 1.";
    return undefined;
  };

  const getSeasonError = (): string | undefined => {
    if (!Number.isInteger(quest.season) || quest.season < 1) return "Season must be a whole number >= 1.";
    return undefined;
  };

  const onSave = async () => {
    if (!authUser.ready || !authUser.user || loading) return;
    const hasErrors = !!getTokensError() || !!getLevelError() || !!getSeasonError();
    if (hasErrors) {
      setSaveAttempted(true);
      return;
    }

    setLoading(true);
    setSaveError(null);

    try {
      const token = await authUser.user.getIdToken();
      const res = await fetch("/api/admin/quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          quest: {
            ...quest,
            id: quest.id.trim(),
            level: Number(quest.level),
            season: Number(quest.season),
            revealed: {
              at: quest.revealed?.at ? new Date(quest.revealed.at) : new Date(),
              context: quest.revealed?.context?.trim() || undefined,
            },
          },
          questTokens: questTokens.map((questToken) => ({
            id: questToken.id,
            faction: questToken.faction,
          })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || json?.details || `Save failed (${res.status})`);
      }
      const { id, season } = json.quest as { id: string; season: number };
      router.push(`/q/${id.replace("q/", "")}/${season}`);
      router.refresh();
    } catch (err: unknown) {
      setSaveError((err as Error)?.message ?? "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DSSection>
      <DSLoadingOverlay loading={loading} error={saveError} dismissError={setSaveError} />
      <DSForm>
        <DSForm.Title>Edit Quest</DSForm.Title>
        <DSForm.Description>
          Edit or create a quest and choose 1-5 quest tokens tied to it.
        </DSForm.Description>

        <DSField
          label="Quest ID"
          value={quest.id}
          onChange={(value) => setQuest((q) => ({ ...q, id: value }))}
          placeholder="Will be generated if new quest"
          readonly
        />

        <DSSelect
          label="Faction"
          options={factionOptions}
          value={quest.faction}
          onChange={(faction) => {
            setQuest((q) => ({ ...q, faction }));
            setQuestTokens((tokens) => {
              const defaultForCurrent = getDefaultTokensForFaction(quest.faction);
              const isDefault =
                tokens.length === defaultForCurrent.length &&
                tokens.every((token, index) => (
                  token.id === defaultForCurrent[index].id &&
                  token.faction === defaultForCurrent[index].faction
                ));
              return isDefault ? getDefaultTokensForFaction(faction) : tokens;
            });
          }}
          required
        />

        <DSField
          label="Level"
          type="number"
          value={String(quest.level)}
          onChange={(value) => setQuest((q) => ({ ...q, level: Number.parseInt(value || "0", 10) }))}
          error={saveAttempted ? getLevelError() : undefined}
          required
        />

        <DSField
          label="Season"
          type="number"
          value={String(quest.season)}
          onChange={(value) => setQuest((q) => ({ ...q, season: Number.parseInt(value || "0", 10) }))}
          error={saveAttempted ? getSeasonError() : undefined}
          required
        />

        <DSSelect
          label="Token Count"
          options={tokenCountOptions}
          value={questTokens.length}
          onChange={(count) => setQuestTokens((tokens) => withTokenCount(tokens, count, quest.faction))}
          required
        />

        {questTokens.map((token, index) => (
          <div key={`${index}-${token.id}`}>
            <DSSelect
              label={`Token ${index + 1}`}
              options={tokenOptions}
              value={token.id}
              onChange={(id) => setQuestTokens((tokens) => tokens.map((current, i) => (
                i === index ? { ...current, id } : current
              )))}
              required
            />
            <DSSelect
              label={`Token ${index + 1} Faction`}
              options={factionOptions}
              value={token.faction}
              onChange={(faction) => setQuestTokens((tokens) => tokens.map((current, i) => (
                i === index ? { ...current, faction } : current
              )))}
              required
            />
          </div>
        ))}

        <DSField.Error error={saveAttempted ? getTokensError() : undefined} />

        <DSButton.Text
          label="Save Quest"
          onClick={onSave}
          loading={loading}
        />
      </DSForm>
    </DSSection>
  );
}
