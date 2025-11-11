import HomeClient from './home-client';
import { fetchArticlesPage, DEFAULT_PAGE_SIZE } from '@/lib/articles-repository';

export default async function Home() {
  const { articles, hasMore, nextCursor } = await fetchArticlesPage({ limit: DEFAULT_PAGE_SIZE });

  return (
    <HomeClient
      initialArticles={articles}
      initialPagination={{
        hasMore,
        nextCursor,
      }}
    />
  );
}
