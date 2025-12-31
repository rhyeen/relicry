import { PromotedItem } from '@/entities/PromotedItem';

export const promotedItemTestIds = {
  promotedItem1: 'pi/1111111111',
  promotedItem2: 'pi/1111111112',
  promotedItem3: 'pi/1111111113',
};

function defaultPromotedItem(id: string): PromotedItem {
  return {
    id,
    artId: null,
    override: {},
    price: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    archivedAt: null,
  };
}

export function getExamplePromotedItem1() {
  return {
    ...defaultPromotedItem(promotedItemTestIds.promotedItem1),
  };
}

export function getExamplePromotedItem2() {
  return {
    ...defaultPromotedItem(promotedItemTestIds.promotedItem2),
  };
}

export function getExamplePromotedItem3() {
  return {
    ...defaultPromotedItem(promotedItemTestIds.promotedItem3),
  };
}
