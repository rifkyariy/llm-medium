'use client';

import { FormEvent, useState } from 'react';

import { formatRelativeTime } from '@/components/articles/format-relative-time';
import { type ArticleComment } from '@/types/article';

type ArticleCommentsProps = {
  comments: ArticleComment[];
  onSubmit: (body: string) => void | Promise<void>;
  isSubmitting?: boolean;
};

export function ArticleComments({ comments, onSubmit, isSubmitting }: ArticleCommentsProps) {
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const busy = isSubmitting ?? pending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();

    if (!message || busy) {
      return;
    }

    setPending(true);

    try {
      await Promise.resolve(onSubmit(message));
      setDraft('');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-12 border-t border-zinc-200 pt-8">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-zinc-900">Conversation</h4>
        <span className="text-xs uppercase tracking-wide text-zinc-400">{comments.length} messages</span>
      </div>

      <ul className="mt-6 space-y-4">
        {comments.map((comment) => {
          const initials = (comment.author || '?').slice(0, 2).toUpperCase();

          return (
          <li key={comment.id} className="flex gap-3 rounded-2xl bg-zinc-50 p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">{comment.author}</span>
                <span>•</span>
                <time dateTime={comment.createdAt}>{formatRelativeTime(comment.createdAt)}</time>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${comment.role === 'assistant' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>
                  {comment.role === 'assistant' ? 'Gemini' : 'You'}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">{comment.body}</p>
            </div>
          </li>
          );
        })}
      </ul>

      <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
        <label className="block text-sm font-semibold text-zinc-700" htmlFor="article-comment">
          Add to the discussion
        </label>
        <textarea
          id="article-comment"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Share feedback, ask a question, or request a follow-up."
          className="h-24 w-full rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed focus:border-black focus:outline-none"
          disabled={busy}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
            disabled={busy || !draft.trim()}
          >
            {busy ? 'Sending…' : 'Post comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
