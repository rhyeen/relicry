import { Aspect } from '@/entities/Aspect';

export function aspectAsArray(aspect: Aspect | [Aspect, Aspect]): [Aspect, Aspect] {
  const aspect1 = Array.isArray(aspect) ? aspect[0] : aspect;
  const aspect2 = Array.isArray(aspect) ? aspect[1] : aspect;
  if (aspect1 === aspect2) return [aspect1, aspect2];
  // Sort aspects. See BannerCardPart.getColorStyle for sorting logic.
  if (aspect1 === Aspect.Brave && aspect2 === Aspect.Charming) {
    return [aspect2, aspect1];
  }
  if (aspect1 === Aspect.Cunning && aspect2 !== Aspect.Wise) {
    return [aspect2, aspect1];
  }
  if (aspect1 === Aspect.Wise && aspect2 !== Aspect.Charming) {
    return [aspect2, aspect1];
  }
  if (aspect1 === Aspect.Charming && aspect2 === Aspect.Wise) {
    return [aspect2, aspect1];
  }
  return [aspect1, aspect2];
}
