import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconRoot({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="22"
      {...props}
    >
      {children}
    </svg>
  );
}

export function CardsIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M7.5 4.5 16.8 3l2.1 13.2-9.3 1.5L7.5 4.5Z" />
      <path d="M5.1 7.2h10.1v13.2H5.1V7.2Z" />
      <path d="M8.3 11.4h3.8" />
      <path d="m10.2 14.6.9-1.5.9 1.5 1.5.9-1.5.9-.9 1.5-.9-1.5-1.5-.9 1.5-.9Z" />
    </IconRoot>
  );
}

export function EventsIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M7 3.8v3" />
      <path d="M17 3.8v3" />
      <path d="M4.8 8.2h14.4" />
      <path d="M5.5 5.5h13a1.5 1.5 0 0 1 1.5 1.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V7a1.5 1.5 0 0 1 1.5-1.5Z" />
      <path d="m12 11.2.9 1.8 2 .3-1.4 1.4.3 2-1.8-.9-1.8.9.3-2-1.4-1.4 2-.3.9-1.8Z" />
    </IconRoot>
  );
}

export function QuestsIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M5.5 4.5h9.2l3.8 3.8v11.2h-13V4.5Z" />
      <path d="M14.4 4.7v4h4" />
      <path d="M8.4 12h5.1" />
      <path d="M8.4 15.4h4" />
      <path d="m17.2 15.2 1.2 1.2 2.2-2.5" />
    </IconRoot>
  );
}

export function ArtIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M6.4 14.2c-1.8 0-3.1-1.4-2.6-3.2.9-3.7 4.4-6.5 8.6-6.5 4.1 0 7.5 2.7 7.5 6.2 0 2-1.2 3.5-3.1 3.5h-1.1c-.9 0-1.4.6-1.4 1.3 0 .9.8 1.1.8 2 0 1.1-1.2 2-3.1 2-3.9 0-7-2.3-7-5.3h1.4Z" />
      <path d="M8.3 9.1h.1" />
      <path d="M12 7.7h.1" />
      <path d="M15.7 9.2h.1" />
      <path d="M9.7 12.4h.1" />
    </IconRoot>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M12 12.2a4.1 4.1 0 1 0 0-8.2 4.1 4.1 0 0 0 0 8.2Z" />
      <path d="M4.8 20c1.3-3.4 3.7-5.1 7.2-5.1s5.9 1.7 7.2 5.1" />
    </IconRoot>
  );
}

export function SignOutIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M10.2 5.2H6.8A1.8 1.8 0 0 0 5 7v10a1.8 1.8 0 0 0 1.8 1.8h3.4" />
      <path d="M14.4 8.2 18.2 12l-3.8 3.8" />
      <path d="M9.2 12h8.7" />
    </IconRoot>
  );
}

export function SignInIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="M13.8 5.2h3.4A1.8 1.8 0 0 1 19 7v10a1.8 1.8 0 0 1-1.8 1.8h-3.4" />
      <path d="M9.6 8.2 13.4 12l-3.8 3.8" />
      <path d="M4.8 12h8.3" />
    </IconRoot>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <IconRoot {...props}>
      <path d="m4.8 11.2 7.2-6.4 7.2 6.4" />
      <path d="M6.8 10v8.8h10.4V10" />
      <path d="M10 18.8v-5.2h4v5.2" />
    </IconRoot>
  );
}
