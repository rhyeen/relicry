import { PromotedItem } from '@/entities/PromotedItem';

export const promotedItemTestIds = {
  promotedItem1: 'pi/0000000001',
  promotedItem2: 'pi/0000000002',
  promotedItem3: 'pi/0000000003',
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
