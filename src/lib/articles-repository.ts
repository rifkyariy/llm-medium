import type { Article, ArticleSection } from '@/types/article';

import { createSupabaseClient } from '@/lib/supabase';

const DEFAULT_PAGE_SIZE = 6;

export type ArticlesPage = {
  articles: Article[];
  nextCursor: string | null;
  hasMore: boolean;
};

type FetchOptions = {
  cursor?: string | null;
  limit?: number;
};

type ArticleRow = {
  id: string;
  title: string;
  author: string;
  subtitle: string | null;
  excerpt: string;
  sections: unknown;
  created_at: string;
  reading_time_minutes: number | null;
  image_url: string | null;
};

function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    subtitle: row.subtitle ?? undefined,
    excerpt: row.excerpt,
    sections: sanitizeSections(row.sections),
    createdAt: row.created_at,
    readingTimeMinutes: row.reading_time_minutes ?? undefined,
    imageUrl: row.image_url ?? undefined,
    comments: [],
  };
}

function sanitizeSections(data: unknown): ArticleSection[] {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data as ArticleSection[];
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as ArticleSection[]) : [];
    } catch {
      return [];
    }
  }

  if (typeof data === 'object') {
    return (data as ArticleSection[]) ?? [];
  }

  return [];
}

export async function fetchArticlesPage({ cursor = null, limit = DEFAULT_PAGE_SIZE }: FetchOptions = {}): Promise<ArticlesPage> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase client is not configured. Set SUPABASE_URL and keys to load articles.');
  }

  const effectiveLimit = Math.max(1, Math.min(limit, 20));

  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(effectiveLimit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error('💥 Failed to fetch articles from Supabase', error);
    throw new Error('Unable to fetch articles from Supabase.');
  }

  const rows = data ?? [];
  const hasMore = rows.length > effectiveLimit;
  const limitedRows = hasMore ? rows.slice(0, effectiveLimit) : rows;
  const articles = limitedRows.map(mapRowToArticle);
  const nextCursor = hasMore ? limitedRows[limitedRows.length - 1]?.created_at ?? null : null;

  return { articles, hasMore, nextCursor };
}

export async function persistArticle(article: Article): Promise<Article> {
  const supabase = createSupabaseClient({ serviceRole: true });

  if (!supabase) {
    throw new Error('Supabase client is not configured. Configure service role or anon key to persist articles.');
  }

  const payload = {
    id: article.id,
    title: article.title,
    author: article.author,
    subtitle: article.subtitle ?? null,
    excerpt: article.excerpt,
    sections: article.sections,
    created_at: article.createdAt,
    reading_time_minutes: article.readingTimeMinutes ?? null,
    image_url: article.imageUrl ?? null,
  };

  const { data, error } = await supabase
    .from('articles')
    .insert(payload)
    .select()
    .single<ArticleRow>();

  if (error) {
    console.error('💥 Failed to persist article to Supabase', error);
    throw new Error('Unable to save article to Supabase.');
  }

  return mapRowToArticle(data);
}

export { DEFAULT_PAGE_SIZE };
