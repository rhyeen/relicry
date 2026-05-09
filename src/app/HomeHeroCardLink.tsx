"use client";

import Link from "next/link";
import type { PointerEvent, ReactNode } from "react";
import styles from "./page.module.css";

type Props = Readonly<{
  children: ReactNode;
  href: string;
  label: string;
}>;

export default function HomeHeroCardLink({ children, href, label }: Props) {
  const handlePointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    event.currentTarget.style.setProperty("--hero-card-tilt-x", `${(-y * 8).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--hero-card-tilt-y", `${(x * 10).toFixed(2)}deg`);
  };

  const resetTilt = (event: PointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.removeProperty("--hero-card-tilt-x");
    event.currentTarget.style.removeProperty("--hero-card-tilt-y");
  };

  return (
    <Link
      aria-label={label}
      className={styles.heroCardLink}
      href={href}
      onPointerLeave={resetTilt}
      onPointerMove={handlePointerMove}
    >
      {children}
    </Link>
  );
}
