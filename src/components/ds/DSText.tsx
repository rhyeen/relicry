import { createElement, type HTMLAttributes, type JSX, type ReactNode } from 'react';
import styles from './DSText.module.css';

type Tone = 'default' | 'muted' | 'accent' | 'success' | 'danger';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'display';
type Weight = 'regular' | 'medium' | 'semibold' | 'bold';
type Font = 'inherit' | 'serif' | 'display';
type Align = 'left' | 'center' | 'right';

type SharedProps = HTMLAttributes<HTMLElement> & {
  as?: keyof JSX.IntrinsicElements;
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  weight?: Weight;
  font?: Font;
  align?: Align;
  balance?: boolean;
};

type TypographyProps = SharedProps;

function Root({
  as,
  children,
  className,
  tone = 'default',
  size = 'md',
  weight = 'regular',
  font = 'inherit',
  align = 'left',
  balance = false,
  ...rest
}: TypographyProps) {
  const Component = as ?? 'p';

  return createElement(
    Component,
    {
      ...rest,
      className: [
        styles.root,
        styles.toneDefault,
        styles[`tone${capitalize(tone)}`],
        styles[`size${normalizeSize(size)}`],
        styles[`weight${capitalize(weight)}`],
        styles[`font${capitalize(font)}`],
        styles[`align${capitalize(align)}`],
        balance ? styles.balance : undefined,
        className,
      ].filter(Boolean).join(' '),
    },
    children,
  );
}

function Heading({
  as,
  size,
  weight = 'medium',
  font = 'serif',
  tone= 'muted',
  balance = true,
  className,
  ...rest
}: TypographyProps) {
  const Component = as ?? 'h1';
  const resolvedSize = size ?? headingSizeFor(Component);

  return (
    <Root
      as={Component}
      size={resolvedSize}
      weight={weight}
      balance={balance}
      tone={tone}
      font={font}
      className={[styles.heading, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

function Body({
  as,
  className,
  size = 'md',
  ...rest
}: TypographyProps) {
  return (
    <Root
      as={as ?? 'p'}
      size={size}
      className={[styles.body, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

function Caption(props: TypographyProps) {
  return <Body as={props.as ?? 'p'} size={props.size ?? 'sm'} tone={props.tone ?? 'muted'} {...props} />;
}

function Eyebrow({
  className,
  weight = 'regular',
  tone = 'accent',
  size = 'xs',
  ...rest
}: TypographyProps) {
  return (
    <Root
      as={rest.as ?? 'p'}
      weight={weight}
      tone={tone}
      size={size}
      className={[styles.eyebrow, className].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}

function normalizeSize(size: Size) {
  if (size === '2xl') return '2xl';
  return capitalize(size);
}

function headingSizeFor(element: keyof JSX.IntrinsicElements): Size {
  if (element === 'h1') return 'display';
  if (element === 'h2') return '2xl';
  if (element === 'h3') return 'xl';
  if (element === 'h4') return 'lg';
  if (element === 'h5') return 'md';
  return 'sm';
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DSText = Object.assign(Root, {
  Heading,
  Body,
  Caption,
  Eyebrow,
});

export default DSText;
