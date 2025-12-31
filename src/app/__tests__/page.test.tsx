import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../page';

describe('Home page', () => {
  test('renders welcome message', () => {
    render(<Home />);
    expect(screen.getByText('Welcome to Relicry')).toBeDefined();
  });
});
