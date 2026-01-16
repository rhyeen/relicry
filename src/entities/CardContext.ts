export enum CardSize {
  PrintSize = '800dpi',
  WebSize = '96dpi',
}

export enum CardType {
  Full = 'full',
  Preview = 'preview',
}

export type CardContext = {
  type: CardType;
  size?: CardSize;
};

export function assetURL(ctx: CardContext, subPath: string): string {
  let basePath: string;
  if (ctx.size === CardSize.PrintSize) {
    basePath = '/800dpi/card/';
  } else {
    basePath = '/assets/card/';
  }
  if (subPath.startsWith('/')) {
    subPath = subPath.slice(1);
  }
  return basePath + subPath;
}
