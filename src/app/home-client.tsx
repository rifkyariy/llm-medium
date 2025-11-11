'use client';

import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';

import { ArticleFeed } from '@/components/articles/ArticleFeed';
import { ArticleModal } from '@/components/articles/ArticleModal';
import { ComposerModal, type ComposerState } from '@/components/composer/ComposerModal';
import { MediumShell } from '@/components/layout/MediumShell';
import { EditorialRail } from '@/components/right-rail/EditorialRail';
import { followingAccounts } from '@/data/following';
import { staffPicks } from '@/data/staff-picks';
import { type Article, type ArticleComment } from '@/types/article';
import { type GeminiSettings } from '@/types/settings';
import { type SearchSuggestion } from '@/types/search';

type HomeClientProps = {
  initialArticles: Article[];
  initialPagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
};

const PAGE_SIZE = 6;

const GEMINI_SETTINGS_STORAGE_KEY = 'llm-medium.gemini-settings';
const DEFAULT_MODEL = 'gemini-2.5-flash';

type GenerationQueueItem = {
  id: string;
  title: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
};

// Real Unsplash portrait photo IDs for profile avatars
const UNSPLASH_PORTRAIT_IDS = [
  '1494790108377-be9c29b29330',
  '1507003211169-0a1dd7228f2d',
  '1539571696357-5a69c17a67c6',
  '1517841905240-472988babdf9',
  '1438761681033-6461ffad8d80',
  '1500648767791-00dcc994a43e',
  '1506794778202-cad84cf45f1d',
  '1534528741775-53994a69daeb',
  '1508214751196-bcfd4ca60f91',
  '1524504388940-b1c1722653e1',
];

export default function HomeClient({ initialArticles, initialPagination }: HomeClientProps) {
  const [articles, setArticles] = useState<Article[]>(() =>
    initialArticles.map(ensureArticleHasComments),
  );
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerState, setComposerState] = useState<ComposerState>({ code: '', guidance: '' });
  const [settings, setSettings] = useState<GeminiSettings>({ apiKey: '', model: DEFAULT_MODEL });
  const [searchQuery, setSearchQuery] = useState('');
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [commentPendingArticleId, setCommentPendingArticleId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const assistantReplyTimeouts = useRef<number[]>([]);
  const [generationQueue, setGenerationQueue] = useState<GenerationQueueItem[]>([]);
  const [hasMore, setHasMore] = useState(initialPagination.hasMore);
  const [nextCursor, setNextCursor] = useState<string | null>(initialPagination.nextCursor);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const queueStats = useMemo(
    () =>
      generationQueue.reduce(
        (acc, item) => {
          acc[item.status] += 1;
          return acc;
        },
        { pending: 0, generating: 0, complete: 0, error: 0 },
      ),
    [generationQueue],
  );

  const followingProfiles = useMemo(
    () =>
      followingAccounts.map((label, index) => ({
        label,
        imageSrc: `https://images.unsplash.com/photo-${UNSPLASH_PORTRAIT_IDS[index % UNSPLASH_PORTRAIT_IDS.length]}?w=64&h=64&fit=crop&crop=faces`,
      })),
    [],
  );

  const selectedArticle = useMemo(
    () => articles.find((a) => a.id === selectedArticleId) ?? null,
    [articles, selectedArticleId],
  );

  const searchSuggestions = useMemo(
    () => buildSearchSuggestions(searchQuery),
    [searchQuery],
  );

  useEffect(() => {
    const stored = localStorage.getItem(GEMINI_SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as GeminiSettings;
        setSettings(parsed);
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      assistantReplyTimeouts.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const handleSettingsChange = (updated: Partial<GeminiSettings>) => {
    const merged = { ...settings, ...updated };
    setSettings(merged);
    localStorage.setItem(GEMINI_SETTINGS_STORAGE_KEY, JSON.stringify(merged));
  };

  const handleComposerSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setComposerError(null);
    setBannerError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: composerState.code,
            guidance: composerState.guidance,
            apiKey: settings.apiKey || undefined,
            model: settings.model || undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }

        const article = (await response.json()) as Article;
        setArticles((prev) => [ensureArticleHasComments(article), ...prev]);
        setComposerOpen(false);
        setComposerState({ code: '', guidance: '' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate article';
        setComposerError(message);
      }
    });
  };

  const handleDirectGenerate = async (code: string, guidance: string, title: string) => {
    console.log('🔵 handleDirectGenerate called with:', { 
      codeLength: code?.length || 0, 
      guidanceLength: guidance?.length || 0,
      title,
      codePreview: code?.slice(0, 100),
      guidancePreview: guidance?.slice(0, 100)
    });

    setBannerError(null);

    if (!code?.trim() && !guidance?.trim()) {
      console.log('⚠️ Empty code and guidance - aborting');
      setBannerError("Cannot generate an article from an empty search. Please type a topic.");
      return;
    }

    const queueId = generateId();
    
    console.log('🚀 Starting direct gen:', { title, code: code?.slice(0, 50) + '...', guidance });
    console.log('⏳ Adding to gen queue with ID:', queueId);
    
    // Add to queue
    setGenerationQueue((prev) => [
      ...prev,
      { id: queueId, title, status: 'pending' },
    ]);

    const promoteToGenerating = () =>
      setGenerationQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: 'generating' } : item,
        ),
      );

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(promoteToGenerating);
    } else {
      promoteToGenerating();
    }

    try {
      const requestBody = {
        code: code || '',
        guidance: guidance || '',
        apiKey: settings.apiKey || undefined,
        model: settings.model || undefined,
      };

      console.log('📡 Fetching /api/generate with settings:', {
        hasApiKey: !!settings.apiKey,
        model: settings.model,
      });
      console.log('📦 Request body:', requestBody);
      console.log('📦 Stringified body length:', JSON.stringify(requestBody).length);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const article = (await response.json()) as Article;
      console.log('✅ Article generated:', article.title);
      
      setArticles((prev) => [ensureArticleHasComments(article), ...prev]);
      
      // Mark as complete
      setGenerationQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: 'complete' } : item,
        ),
      );

      // Remove from queue after 2 seconds
      setTimeout(() => {
        setGenerationQueue((prev) => prev.filter((item) => item.id !== queueId));
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate article';
      console.error('💥 Article failed:', message, err);
      
      // Mark as error
      setGenerationQueue((prev) =>
        prev.map((item) =>
          item.id === queueId ? { ...item, status: 'error', error: message } : item,
        ),
      );

      // Remove from queue after 5 seconds
      setTimeout(() => {
        setGenerationQueue((prev) => prev.filter((item) => item.id !== queueId));
      }, 5000);

      setBannerError(message);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    // Clear the search immediately to close dropdown
    setSearchQuery('');

    if (suggestion.action === 'generate') {
      // Always perform a direct generation, regardless of index
      handleDirectGenerate(
        suggestion.payload.code,
        suggestion.payload.guidance,
        suggestion.title,
      );
      return;
    }

    if (suggestion.action === 'compose') {
      // Just open the modal for editing
      setComposerState(suggestion.payload);
      setComposerOpen(true);
    }
  };

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setLoadMoreError(null);
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      if (nextCursor) {
        params.set('cursor', nextCursor);
      }

      const response = await fetch(`/api/articles?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({ error: 'Unable to load articles' }));
        throw new Error(errorPayload.error ?? `Failed with status ${response.status}`);
      }

      const payload = (await response.json()) as {
        articles: Article[];
        hasMore: boolean;
        nextCursor: string | null;
      };

      setArticles((prev) => [
        ...prev,
        ...payload.articles.map(ensureArticleHasComments),
      ]);
      setHasMore(payload.hasMore);
      setNextCursor(payload.nextCursor);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error while loading more articles';
      setLoadMoreError(message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAddComment = (articleId: string, body: string) => {
    const newComment: ArticleComment = {
      id: generateId(),
      author: 'Current User',
      body,
      createdAt: new Date().toISOString(),
      role: 'user',
    };

    setArticles((prev) =>
      prev.map((article) => {
        if (article.id !== articleId) return article;
        const comments = article.comments ?? [];
        return {
          ...article,
          comments: [...comments, newComment],
        };
      }),
    );

    setCommentPendingArticleId(articleId);

    const article = articles.find((a) => a.id === articleId);
    if (!article) return;

    const assistantReply = buildAssistantReply(article, body);
    const timeoutId = window.setTimeout(() => {
      setArticles((prev) =>
        prev.map((article) => {
          if (article.id !== articleId) return article;
          const comments = article.comments ?? [];
          return {
            ...article,
            comments: [...comments, assistantReply!],
          };
        }),
      );

      setCommentPendingArticleId((current) => (current === articleId ? null : current));
      assistantReplyTimeouts.current = assistantReplyTimeouts.current.filter((id) => id !== timeoutId);
    }, 900);

    assistantReplyTimeouts.current.push(timeoutId);
  };

  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSubmitTopSuggestion = () => {
    if (searchSuggestions.length) {
      handleSuggestionSelect(searchSuggestions[0]);
    }
  };

  return (
    <MediumShell
      currentNav="home"
      onCompose={() => setComposerOpen(true)}
      following={followingProfiles}
      rightRail={<EditorialRail picks={staffPicks} />}
      search={{
        query: searchQuery,
        onQueryChange: handleSearchQueryChange,
        suggestions: searchSuggestions,
        onSuggestionSelect: handleSuggestionSelect,
        onSubmitTopSuggestion: handleSubmitTopSuggestion,
        settings,
        onSettingsChange: handleSettingsChange,
      }}
    >
      {bannerError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {bannerError}
        </div>
      )}

      <div className="mb-6 border-b border-zinc-200">
        <div className="flex gap-6 text-sm font-semibold">
          <button className="border-b-2 border-black pb-3">For you</button>
          <button className="pb-3 text-zinc-500 hover:text-black">Featured</button>
        </div>
      </div>

      <ArticleFeed
        articles={articles}
        onSelect={(article) => setSelectedArticleId(article.id)}
        emptyMessage="No articles yet. Use the Write button to turn your code into a story."
      />

      {loadMoreError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadMoreError}
        </div>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="rounded-full border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoadingMore ? 'Loading more articles…' : 'Load more stories'}
          </button>
        </div>
      )}

      {composerOpen && (
        <ComposerModal
          state={composerState}
          onClose={() => (!isPending ? setComposerOpen(false) : null)}
          onChange={setComposerState}
          onSubmit={handleComposerSubmit}
          isPending={isPending}
          error={composerError}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      )}

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticleId(null)}
          comments={selectedArticle.comments ?? []}
          onAddComment={(body) => handleAddComment(selectedArticle.id, body)}
          isReplying={commentPendingArticleId === selectedArticle.id}
        />
      )}

      {/* Generation Queue - Bottom Right */}
      {generationQueue.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 w-80 space-y-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Reconnecting
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              {queueStats.pending} waiting · {queueStats.generating} processing · {queueStats.complete} posted · {queueStats.error} issues
            </p>
          </div>

          {generationQueue.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-4 shadow-lg transition-all ${
                item.status === 'pending'
                  ? 'border-amber-200 bg-amber-50'
                  : item.status === 'generating'
                    ? 'border-blue-200 bg-blue-50'
                    : item.status === 'complete'
                      ? 'border-green-200 bg-green-50'
                      : item.status === 'error'
                        ? 'border-red-200 bg-red-50'
                        : 'border-zinc-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {item.status === 'pending' && (
                    <svg
                      className="h-5 w-5 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="9" strokeWidth={2} />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 7v5l3 2"
                      />
                    </svg>
                  )}
                  {item.status === 'generating' && (
                    <svg
                      className="h-5 w-5 animate-spin text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                  {item.status === 'complete' && (
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                  {item.status === 'error' && (
                    <svg
                      className="h-5 w-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.status === 'pending'
                        ? 'text-amber-900'
                        : item.status === 'generating'
                          ? 'text-blue-900'
                          : item.status === 'complete'
                            ? 'text-green-900'
                            : item.status === 'error'
                              ? 'text-red-900'
                              : 'text-zinc-900'
                    }`}
                  >
                    {item.status === 'pending' && 'Queued'}
                    {item.status === 'generating' && 'Generating...'}
                    {item.status === 'complete' && 'Posted'}
                    {item.status === 'error' && 'Failed'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-600 truncate">{item.title}</p>
                  {item.error && (
                    <p className="mt-1 text-xs text-red-600">{item.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MediumShell>
  );
}

function ensureArticleHasComments(article: Article): Article {
  return {
    ...article,
    comments: Array.isArray(article.comments) ? article.comments : [],
  };
}

function buildSearchSuggestions(query: string): SearchSuggestion[] {
  const trimmed = query.trim();
  const topic = trimmed.length ? trimmed : 'Gemini developer workflows';
  const slug =
    topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'topic';

  return [
    {
      id: `generate-${slug}`,
      title: `Generate article for "${topic}"`,
      description: 'Use Gemini to turn this idea into a shareable Medium draft.',
      action: 'generate',
      payload: {
        code: buildSearchCode(topic),
        guidance: `Write a practical walkthrough focused on ${topic}.`,
      },
    },
    {
      id: `compose-code-${slug}`,
      title: 'Open Write modal with starter code',
      description: 'Jump into the composer with a scaffold you can refine.',
      action: 'compose',
      payload: {
        code: `function exploreIdea() {
  // Replace with the implementation that inspired this article.
  console.log('${topic}');
}
`,
        guidance: `Highlight why ${topic} matters and how readers can replicate it.`,
      },
    },
    {
      id: `compose-guidance-${slug}`,
      title: 'Just capture the angle first',
      description: 'Prefill the guidance field so you can decide on examples later.',
      action: 'compose',
      payload: {
        code: '',
        guidance: `Summarize the audience and desired outcomes for ${topic}.`,
      },
    },
  ];
}

function buildSearchCode(topic: string): string {
  const safeTopic = topic.trim() || 'Gemini developer workflows';

  return `// Idea captured via the search assistant
const topic = ${JSON.stringify(safeTopic)};

export function illustrateIdea() {
  console.log('Expanding on', topic);
}
`;
}

function buildAssistantReply(article: Article, message: string): ArticleComment {
  const snippet = message.length > 150 ? `${message.slice(0, 147)}…` : message;

  return {
    id: generateId(),
    author: 'Gemini Assistant',
    body: `Appreciate your perspective on "${snippet}". I'll fold that into future updates of "${article.title}".`,
    createdAt: new Date().toISOString(),
    role: 'assistant',
  };
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
}