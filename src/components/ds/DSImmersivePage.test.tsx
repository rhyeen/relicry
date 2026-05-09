import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import type { ImgHTMLAttributes } from 'react';
import DSImmersivePage from './DSImmersivePage';

vi.mock('next/image', () => ({
  default: ({
    priority,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    void priority;
    return createElement('img', props);
  },
}));

afterEach(() => {
  cleanup();
});

describe('DSImmersivePage', () => {
  it('renders an immersive hero and scroll cue', () => {
    render(
      <DSImmersivePage image={{ src: '/hero.webp', width: 1200, height: 800, priority: true }}>
        <DSImmersivePage.Hero
          eyebrow="A TCG Adventure Game"
          title="Relicry"
          subtitle="Adventure through tactical cards."
          primaryAction={{ href: '/cards', label: 'Browse Cards' }}
          secondaryAction={{ href: '/quests', label: 'View Quests' }}
          scrollTargetId="content"
        />
        <DSImmersivePage.Panel id="content">Panel content</DSImmersivePage.Panel>
      </DSImmersivePage>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Relicry' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Browse Cards' }).getAttribute('href')).toBe('/cards');
    expect(screen.getByRole('link', { name: 'View Quests' }).getAttribute('href')).toBe('/quests');
    expect(screen.getByRole('link', { name: 'Scroll to content' }).getAttribute('href')).toBe('#content');
    expect(screen.getByText('Panel content')).toBeDefined();
  });

  it('renders an image hero title', () => {
    render(
      <DSImmersivePage image={{ src: '/hero.webp', width: 1200, height: 800 }}>
        <DSImmersivePage.Hero
          eyebrow="A TCG Adventure Game"
          title={{ src: '/logo.webp', alt: 'Relicry', width: 1280, height: 480 }}
          subtitle="Adventure through tactical cards."
        />
      </DSImmersivePage>,
    );

    const heading = screen.getByRole('heading', { level: 1, name: 'Relicry' });
    const logo = screen.getByRole('img', { name: 'Relicry' });

    expect(heading.contains(logo)).toBe(true);
    expect(logo.getAttribute('src')).toBe('/logo.webp');
  });
});
