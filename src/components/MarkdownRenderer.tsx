import type { ReactNode } from 'react';
import styles from './MarkdownRenderer.module.css';

type Props = Readonly<{
  markdown: string;
}>;

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let index = 0;

  while (remaining.length > 0) {
    const next = remaining.match(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/);
    if (!next || next.index === undefined) {
      nodes.push(remaining);
      break;
    }

    const start = next.index;
    const token = next[0];
    if (start > 0) {
      nodes.push(remaining.slice(0, start));
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code key={`${keyPrefix}-code-${index}`} className={styles.inlineCode}>
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={`${keyPrefix}-strong-${index}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={`${keyPrefix}-em-${index}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('[')) {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link) {
        nodes.push(
          <a
            key={`${keyPrefix}-a-${index}`}
            className={styles.link}
            href={link[2]}
            target="_blank"
            rel="noreferrer noopener"
          >
            {link[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    remaining = remaining.slice(start + token.length);
    index += 1;
  }

  return nodes;
}

function renderMarkdown(markdown: string): ReactNode[] {
  const lines = markdown.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const nextKey = (prefix: string) => `${prefix}-${key++}`;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length && lines[i].startsWith('```')) i += 1;
      blocks.push(
        <pre key={nextKey('pre')} className={styles.codeBlock}>
          <code className={styles.codeBlockInner}>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const content = renderInlineMarkdown(heading[2], nextKey('h-inline'));
      if (level === 1) blocks.push(<h1 key={nextKey('h1')} className={styles.h1}>{content}</h1>);
      if (level === 2) blocks.push(<h2 key={nextKey('h2')} className={styles.h2}>{content}</h2>);
      if (level === 3) blocks.push(<h3 key={nextKey('h3')} className={styles.h3}>{content}</h3>);
      if (level === 4) blocks.push(<h4 key={nextKey('h4')} className={styles.h4}>{content}</h4>);
      if (level === 5) blocks.push(<h5 key={nextKey('h5')} className={styles.h5}>{content}</h5>);
      if (level === 6) blocks.push(<h6 key={nextKey('h6')} className={styles.h6}>{content}</h6>);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: ReactNode[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^[-*]\s+/, '');
        items.push(
          <li key={nextKey('li')} className={styles.listItem}>
            {renderInlineMarkdown(itemText, nextKey('li-inline'))}
          </li>,
        );
        i += 1;
      }
      blocks.push(<ul key={nextKey('ul')} className={styles.list}>{items}</ul>);
      continue;
    }

    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith('```') &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    const paragraphText = paragraphLines.join(' ');
    blocks.push(
      <p key={nextKey('p')} className={styles.paragraph}>
        {renderInlineMarkdown(paragraphText, nextKey('p-inline'))}
      </p>,
    );
  }

  return blocks;
}

export default function MarkdownRenderer({ markdown }: Props) {
  return <article className={styles.article}>{renderMarkdown(markdown)}</article>;
}
