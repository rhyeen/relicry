export type FlavorText = {
  extended: {
    artistId: string;
    artId: string;
  } | null;
  onCard: {
    text: string;
    source?: string;
  } | null;
}
