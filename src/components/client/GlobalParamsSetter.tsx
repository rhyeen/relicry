"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeSizeSP } from '@/lib/normalizeSearchParams';
import { CardSize } from '@/entities/CardContext';

export default function GlobalParamsSetter() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const size = normalizeSizeSP(searchParams);
    if (size === CardSize.PrintSize) {
      const header = document.querySelector<HTMLElement>("[data-global-header]");
      const footer = document.querySelector<HTMLElement>("[data-global-footer]");
      header?.classList.toggle("hide", true);
      footer?.classList.toggle("hide", true);
    }
  }, [searchParams]);

  return null;
}
