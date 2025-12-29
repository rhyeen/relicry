export interface RewardOption {
  id: string;
  // @NOTE: We do it this way so that we can deprecate options without losing historical data
  rewardId: string;
  heraldId: string;
  promotedItemId: string;
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
  archivedReason?: RewardArchivedReason;
}

export enum RewardArchivedReason {
  NoMoreStock = 'no_more_stock',
  MistakeListing = 'mistake_listing',
  HeraldNotAvailable = 'herald_not_available',
  FlaggedAsInappropriate = 'item_flagged_as_inappropriate',
}
