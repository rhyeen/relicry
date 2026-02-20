import { Faction } from '@/entities/Faction';

type Props = {
  faction: Faction;
}

const localeEn = {
  [Faction.BridlewildKin]: 'Bridlewild Kin',
  [Faction.IronbandGuild]: 'Ironband Guild',
  [Faction.NightglassCo]: 'Nightglass Co.',
  [Faction.OrdoAether]: 'Ordo Aether',
}

export function getName(faction: Faction): string {
  return localeEn[faction] ?? 'Unknown Faction';
}

export default function FactionName({ faction }: Props) {
  return (
    <span>{getName(faction)}</span>
  );
}
