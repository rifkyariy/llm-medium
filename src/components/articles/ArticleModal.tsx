import Image from 'next/image';
import { ReactNode } from 'react';

import { Article, type ArticleComment } from '@/types/article';
import { formatRelativeTime } from '@/components/articles/format-relative-time';
import { ArticleComments } from '@/components/articles/ArticleComments';

type BodySegment =
  | {
      type: 'text';
      content: string;
    }
  | {
      type: 'code';
      language?: string;
      content: string;
    };

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  if (!text) {
    return [];
  }

  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const segments = text.split(pattern);

  return segments
    .filter((segment) => segment.length > 0)
    .map((segment, index) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return (
          <strong key={`${keyPrefix}-strong-${index}`}>
            {segment.slice(2, -2)}
          </strong>
        );
      }

      if (segment.startsWith('`') && segment.endsWith('`')) {
        return (
          <code
            key={`${keyPrefix}-code-${index}`}
            className="rounded bg-zinc-100 px-1 py-0.5 text-sm text-zinc-800"
          >
            {segment.slice(1, -1)}
          </code>
        );
      }

      return (
        <span key={`${keyPrefix}-text-${index}`}>{segment}</span>
      );
    });
}

function renderTextSegment(content: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const lines = content.split(/\r?\n/);

  let paragraphBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) {
      return;
    }

    const paragraphText = paragraphBuffer.join(' ').trim();
    if (paragraphText) {
      const paragraphKey = `${keyPrefix}-paragraph-${nodes.length}`;
      nodes.push(
        <p key={paragraphKey} className="mt-4">
          {renderInlineMarkdown(paragraphText, paragraphKey)}
        </p>,
      );
    }
    paragraphBuffer = [];
  };

  const flushList = () => {
    if (!listBuffer.length) {
      return;
    }

    const listKey = `${keyPrefix}-list-${nodes.length}`;
    nodes.push(
      <ul key={listKey} className="mt-4 list-disc space-y-2 pl-6">
        {listBuffer.map((item, itemIndex) => (
          <li key={`${listKey}-item-${itemIndex}`}>
            {renderInlineMarkdown(item.trim(), `${listKey}-item-${itemIndex}`)}
          </li>
        ))}
      </ul>,
    );

    listBuffer = [];
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    const bulletMatch = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      listBuffer.push(bulletMatch[2]);
      return;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  });

  flushParagraph();
  flushList();

  return nodes;
}

function parseSectionBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  const codeRegex = /```([a-zA-Z0-9+\-]*)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeRegex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: body.slice(lastIndex, match.index) });
    }

    segments.push({ type: 'code', language: match[1], content: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < body.length) {
    segments.push({ type: 'text', content: body.slice(lastIndex) });
  }

  return segments;
}

function renderSectionBody(body: string): ReactNode {
  const segments = parseSectionBody(body);

  return segments.flatMap((segment, segmentIndex) => {
    if (segment.type === 'code') {
      const language = segment.language?.trim();
      const codeContent = segment.content.replace(/\n+$/, '');

      return (
        <pre
          key={`code-${segmentIndex}`}
          className="not-prose mt-4 overflow-x-auto rounded-xl bg-zinc-900/95 p-4 text-sm text-zinc-100 shadow-inner"
        >
          <code className={language ? `language-${language}` : undefined}>{codeContent}</code>
        </pre>
      );
    }

    return renderTextSegment(segment.content, `text-${segmentIndex}`);
  });
}

type ArticleModalProps = {
  article: Article;
  onClose: () => void;
  comments: ArticleComment[];
  onAddComment: (body: string) => void | Promise<void>;
  isReplying?: boolean;
};

export function ArticleModal({ article, onClose, comments, onAddComment, isReplying = false }: ArticleModalProps) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex h-full w-full flex-col bg-white">
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Medium Articles
            </p>
            <h2 className="mt-1 text-3xl font-bold text-zinc-900">{article.title}</h2>
            {article.subtitle && <p className="mt-1 text-lg text-zinc-600">{article.subtitle}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <time dateTime={article.createdAt}>{formatRelativeTime(article.createdAt)}</time>
              {article.readingTimeMinutes && (
                <>
                  <span>•</span>
                  <span>{article.readingTimeMinutes} min read</span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-10">
            {article.imageUrl && (
              <div className="relative mb-8 h-72 w-full overflow-hidden rounded-3xl">
                <Image
                  src={article.imageUrl}
                  alt={`${article.title} hero image`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 768px, 100vw"
                />
              </div>
            )}

            <article className="prose prose-zinc max-w-none">
              {article.sections.map((section) => (
                <section key={section.heading} className="mb-10">
                  <h3>{section.heading}</h3>
                  <div className="text-base leading-7 text-zinc-700">{renderSectionBody(section.body)}</div>
                </section>
              ))}
            </article>

            <ArticleComments comments={comments} onSubmit={onAddComment} isSubmitting={isReplying} />
          </div>
        </div>
      </div>
    </div>
  );
}
