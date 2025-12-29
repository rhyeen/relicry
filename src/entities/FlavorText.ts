import { LocaleMap } from './LocaleMap';

export interface FlavorText {
  extended: {
    artistId: string;
    artId: string;
  } | null;
  onCard: LocaleMap<{
    text: string;
    source?: string;
  }> | null;
}
