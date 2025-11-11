'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { type Article } from '@/types/article';
import { formatRelativeTime } from '@/components/articles/format-relative-time';

type ArticleCardProps = {
  article: Article;
  onSelect: () => void;
};

export function ArticleCard({ article, onSelect }: ArticleCardProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    // Format time on client side to avoid hydration mismatch
    setRelativeTime(formatRelativeTime(article.createdAt));
    
    // Optional: Update every minute
    const interval = setInterval(() => {
      setRelativeTime(formatRelativeTime(article.createdAt));
    }, 60000);
    
    return () => clearInterval(interval);
  }, [article.createdAt]);

  return (
    <article
      className="cursor-pointer rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-lg"
      onClick={onSelect}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Code to Story</div>
          <h3 className="mt-2 text-xl font-bold text-zinc-900">{article.title}</h3>
          {article.subtitle && <p className="mt-1 text-sm font-medium text-zinc-600">{article.subtitle}</p>}
          <p className="mt-3 text-sm leading-relaxed text-zinc-700">{article.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-zinc-500">
            <span>by {article.author ?? 'Medium'}</span>
            <span>•</span>
            <time dateTime={article.createdAt} suppressHydrationWarning>
              {relativeTime || 'just now'}
            </time>
            {article.readingTimeMinutes && (
              <>
                <span>•</span>
                <span>{article.readingTimeMinutes} min read</span>
              </>
            )}
          </div>
        </div>
        {article.imageUrl && (
          <div className="relative hidden h-32 w-48 flex-shrink-0 overflow-hidden rounded-2xl md:block">
            <Image src={article.imageUrl} alt={`${article.title} concept art`} fill className="object-cover" sizes="192px" />
          </div>
        )}
      </div>
    </article>
  );
}
