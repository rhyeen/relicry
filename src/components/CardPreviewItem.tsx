"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import StoredImage from "@/components/client/StoredImage";
import { CardPreviewListItem } from "@/lib/cardsApi";
import { Aspect } from "@/entities/Aspect";
import { ImageSize } from "@/entities/Image";
import { aspectAsArray } from "./card/card-parts/aspectsAsArray";
import styles from "./CardPreviewItem.module.css";

type CardPreviewItemProps = Readonly<{
  item: CardPreviewListItem;
}>;

export default function CardPreviewItem({ item }: CardPreviewItemProps) {
  const { card, href, previewImage } = item;
  const drawLimit = "drawLimit" in card ? card.drawLimit : undefined;
  const title = card.title?.trim() || "Untitled";
  const subTitle = card.subTitle?.trim();
  const typeLabel = labelize(card.type);
  const rarityLabel = labelize(card.rarity);
  const aspects = getAspects(card.aspect);
  const frameStyle = getFrameStyle(card.rarity, aspects);
  const scrapCost = card.scrapCost ?? [];
  const drawSignal = card.type === 'deck' && typeof drawLimit === 'number'
    ? drawLimit === -1 ? '*' : String(drawLimit)
    : undefined;

  return (
    <Link
      href={href}
      className={styles.root}
      data-rarity={card.rarity}
      data-type={card.type}
      style={frameStyle}
    >
      <div className={styles.artFrame}>
        {previewImage ? (
          <StoredImage
            image={previewImage}
            size={ImageSize.CardPreview}
            alt={title}
            className={styles.image}
          />
        ) : (
          <div className={styles.fallback}>
            No art
          </div>
        )}
        <span className={styles.typeBadge}>{typeLabel}</span>
      </div>
      {drawSignal ? (
        <span className={styles.cornerSignal} aria-label={`Draw limit ${drawSignal}`}>
          {drawSignal}
        </span>
      ) : null}
      <div className={styles.content}>
        <span className={styles.rarity}>{rarityLabel}</span>
        <span className={styles.title}>{title}</span>
        {subTitle ? <span className={styles.subtitle}>{subTitle}</span> : null}
        {aspects.length > 0 ? (
          <span className={styles.aspectBanner} aria-label={`Aspect ${aspects.map(labelize).join(', ')}`} />
        ) : null}
        {card.type === 'gambit' &&
          <span className={styles.aspectBanner} aria-label="Gambit" />
        }
        {scrapCost.length > 0 ? (
          <span className={styles.scrapRow}>
            <span className={styles.scrapCosts}>
              {scrapCost.map((cost, index) => (
                <ScrapPip key={index} cost={cost} />
              ))}
            </span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function ScrapPip({ cost }: Readonly<{ cost: Aspect | [Aspect, Aspect] }>) {
  const aspects = aspectAsArray(cost);
  const label = aspects[0] === aspects[1]
    ? labelize(aspects[0])
    : `${labelize(aspects[0])} or ${labelize(aspects[1])}`;

  return (
    <span
      className={styles.scrapPip}
      style={getScrapStyle(aspects)}
      title={label}
      aria-label={label}
    />
  );
}

function getAspects(aspect: CardPreviewListItem['card']['aspect']): Aspect[] {
  if (!aspect) return [];
  const [primary, secondary] = aspectAsArray(aspect);
  return primary === secondary ? [primary] : [primary, secondary];
}

function labelize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getFrameStyle(rarity: string, aspects: Aspect[]): CSSProperties {
  const [primary, secondary] = aspects.length > 0 ? aspects : [Aspect.Gambit, Aspect.Gambit];
  const rarityColor = rarityAccent(rarity);
  const bannerPrimary = primary;
  const bannerSecondary = secondary ?? primary;

  return {
    '--preview-border': rarityColor,
    '--preview-rarity-wash': `linear-gradient(135deg, color-mix(in srgb, ${rarityColor} 24%, transparent), transparent 56%)`,
    '--preview-accent': rarityColor,
    '--banner-color': bannerColor(bannerPrimary, bannerSecondary),
  } as CSSProperties;
}

function getScrapStyle(aspects: [Aspect, Aspect]): CSSProperties {
  const [primary, secondary] = aspects;

  return {
    '--scrap-top': aspectColor(primary),
    '--scrap-bottom': aspectColor(secondary),
  } as CSSProperties;
}

function aspectColor(aspect: Aspect) {
  switch (aspect) {
    case Aspect.Brave:
      return 'rgb(210, 38, 70)';
    case Aspect.Cunning:
      return 'rgb(8, 186, 103)';
    case Aspect.Wise:
      return 'rgb(47, 75, 255)';
    case Aspect.Charming:
      return 'rgb(223, 163, 24)';
    default:
      throw new Error(`Unknown aspect: ${aspect}`);
  }
}

function rarityAccent(rarity: string) {
  switch (rarity) {
    case 'common':
      return '#bcd5bc';
    case 'rare':
      return '#c779c2';
    case 'epic':
      return '#ed9d26';
    case 'legendary':
      return '#8d2fff';
    default:
      throw new Error(`Unknown rarity: ${rarity}`);
  }
}

function bannerColor(primary: Aspect, secondary: Aspect) {
  if (primary !== secondary) {
    switch (aspectPairKey(primary, secondary)) {
      case 'redBlue':
        return 'linear-gradient(145deg, rgba(202, 0, 38, 1) 20%, rgba(32, 61, 222, 0.7) 70%)';
      case 'redGreen':
        return 'linear-gradient(145deg, rgba(202, 0, 38, 1) 20%, rgba(0, 165, 88, 0.7) 70%)';
      case 'yellowRed':
        return 'linear-gradient(145deg, rgb(205, 143, 0) 20%,  rgb(202, 0, 38, 0.7) 70%)';
      case 'yellowGreen':
        return 'linear-gradient(145deg, rgb(205, 143, 0) 30%, rgba(0, 165, 88, 0.7) 70%)';
      case 'blueYellow':
        return 'linear-gradient(145deg, rgba(32, 61, 222, 1) 20%, rgba(205, 143, 0, 0.7) 70%)';
      case 'greenBlue':
        return 'linear-gradient(145deg, rgba(0, 165, 88, 1) 20%, rgba(32, 61, 222, 0.7) 70%)';
      default:
        throw new Error(`Unknown aspect pair: ${primary} and ${secondary}`);
    }
  }

  switch (primary) {
    case Aspect.Brave:
      return 'linear-gradient(145deg, rgba(202, 0, 38, 1) 20%, rgba(249, 45, 89, 0.56) 80%)';
    case Aspect.Cunning:
      return 'linear-gradient(145deg, rgba(0, 165, 88, 1) 20%, rgba(0, 165, 88, 0.7) 80%)';
    case Aspect.Wise:
      return 'linear-gradient(145deg, rgba(32, 61, 222, 1) 20%, rgba(32, 61, 222, 0.7) 80%)';
    case Aspect.Charming:
      return 'linear-gradient(145deg, rgb(205, 143, 0) 20%, rgb(205, 143, 0, 0.7) 80%)';
    case Aspect.Gambit:
      return 'linear-gradient(145deg, #ffffffcd 5%, #e628027e 35%, #ffcc00d2 60%, #30ffb79f 70%, #6340d7ce 85%, #9d99ff44 100%)';
    default:
      throw new Error(`Unknown aspect: ${primary}`);
  }
}

function aspectPairKey(primary: Aspect, secondary: Aspect) {
  if (primary === Aspect.Brave && secondary === Aspect.Cunning) return 'redGreen';
  if (primary === Aspect.Brave && secondary === Aspect.Wise) return 'redBlue';
  if (primary === Aspect.Charming && secondary === Aspect.Brave) return 'yellowRed';
  if (primary === Aspect.Charming && secondary === Aspect.Cunning) return 'yellowGreen';
  if (primary === Aspect.Cunning && secondary === Aspect.Wise) return 'greenBlue';
  if (primary === Aspect.Wise && secondary === Aspect.Charming) return 'blueYellow';
  return 'redBlue';
}
