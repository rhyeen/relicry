import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackPage from '../feedback/page';

describe('Feedback page', () => {
  test('renders feedback form', () => {
    render(<FeedbackPage />);
    expect(screen.getByText('Leave Feedback')).toBeInTheDocument();
  });
});
