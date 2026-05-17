import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import DSButton from './DSButton';

afterEach(() => {
  cleanup();
});

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

  it('clicks a configured primary button when Enter is pressed inside its form', () => {
    const onClick = vi.fn();

    render(
      <form>
        <input aria-label="Name" />
        <DSButton label="Save" onClick={onClick} submitOnEnter variant="primary" />
      </form>
    );

    fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores submitOnEnter for non-primary buttons', () => {
    const onClick = vi.fn();

    render(
      <form>
        <input aria-label="Name" />
        <DSButton label="Save" onClick={onClick} submitOnEnter />
      </form>
    );

    fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Enter' });

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not click from multiline text input', () => {
    const onClick = vi.fn();

    render(
      <form>
        <textarea aria-label="Feedback" />
        <DSButton label="Submit Feedback" onClick={onClick} submitOnEnter variant="primary" />
      </form>
    );

    fireEvent.keyDown(screen.getByLabelText('Feedback'), { key: 'Enter' });

    expect(onClick).not.toHaveBeenCalled();
  });
});
