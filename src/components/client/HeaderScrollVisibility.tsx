'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const MIN_SCROLL_DELTA = 8;
const TOP_REVEAL_OFFSET = 24;

export default function HeaderScrollVisibility() {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector<HTMLElement>('.global-header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let accumulatedScrollDelta = 0;
    let ticking = false;

    const setHidden = (hidden: boolean) => {
      if (hidden) {
        header.setAttribute('data-scroll-hidden', 'true');
      } else {
        header.removeAttribute('data-scroll-hidden');
      }
    };

    const update = () => {
      ticking = false;

      const nextScrollY = Math.max(window.scrollY, 0);
      const delta = nextScrollY - lastScrollY;

      if (nextScrollY <= TOP_REVEAL_OFFSET) {
        setHidden(false);
        accumulatedScrollDelta = 0;
      } else if (delta !== 0) {
        const changedDirection =
          accumulatedScrollDelta !== 0 && Math.sign(delta) !== Math.sign(accumulatedScrollDelta);

        accumulatedScrollDelta = changedDirection ? delta : accumulatedScrollDelta + delta;

        if (accumulatedScrollDelta >= MIN_SCROLL_DELTA) {
          setHidden(true);
          accumulatedScrollDelta = 0;
        } else if (accumulatedScrollDelta <= -MIN_SCROLL_DELTA) {
          setHidden(false);
          accumulatedScrollDelta = 0;
        }
      }

      lastScrollY = nextScrollY;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      header.removeAttribute('data-scroll-hidden');
    };
  }, [pathname]);

  return null;
}
