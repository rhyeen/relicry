import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import MarkdownRenderer from '../MarkdownRenderer';

describe('MarkdownRenderer', () => {
  test('renders headings and paragraphs', () => {
    render(<MarkdownRenderer markdown={'# Title\n\nBody text'} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeDefined();
    expect(screen.getByText('Body text')).toBeDefined();
  });

  test('renders unordered lists', () => {
    render(<MarkdownRenderer markdown={'- First\n- Second'} />);
    expect(screen.getByRole('list')).toBeDefined();
    expect(screen.getByText('First')).toBeDefined();
    expect(screen.getByText('Second')).toBeDefined();
  });

  test('renders inline markdown formatting', () => {
    const { container } = render(
      <MarkdownRenderer markdown={'A **bold** and *italic* and `code` word.'} />,
    );
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelector('em')?.textContent).toBe('italic');
    expect(container.querySelector('code')?.textContent).toBe('code');
  });

  test('renders links with safe attributes', () => {
    render(<MarkdownRenderer markdown={'Visit [Relicry](https://example.com)'} />);
    const link = screen.getByRole('link', { name: 'Relicry' });
    expect(link.getAttribute('href')).toBe('https://example.com');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer noopener');
  });

  test('renders fenced code blocks', () => {
    const { container } = render(
      <MarkdownRenderer markdown={'```\nconst x = 1;\nconsole.log(x);\n```'} />,
    );
    const pre = container.querySelector('pre');
    expect(pre).toBeTruthy();
    expect(pre?.textContent).toContain('const x = 1;');
    expect(pre?.textContent).toContain('console.log(x);');
  });
});

