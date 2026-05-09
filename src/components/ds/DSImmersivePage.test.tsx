import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
