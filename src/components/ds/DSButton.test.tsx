import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import DSButton from './DSButton';

describe('DSButton', () => {
  it('keeps the default button API working', () => {
    render(<DSButton label="Save" />);

    expect(screen.getByRole('button', { name: 'Save' })).toBeDefined();
  });

  it('renders link buttons with optional variant and size classes', () => {
    render(<DSButton href="/cards" label="Browse Cards" variant="primary" size="lg" />);

    const link = screen.getByRole('link', { name: 'Browse Cards' });
    expect(link.getAttribute('href')).toBe('/cards');
    expect(link.className).toContain('variantPrimary');
    expect(link.className).toContain('sizeLg');
  });
});
