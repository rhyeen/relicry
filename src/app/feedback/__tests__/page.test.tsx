import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackPage from '../page';

describe('Feedback page', () => {
  test('renders feedback form', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Leave Feedback')).toBeDefined();
  });
});
