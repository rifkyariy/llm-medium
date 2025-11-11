import { Article } from '@/types/article';
import { ArticleCard } from '@/components/articles/ArticleCard';

type ArticleFeedProps = {
  articles: Article[];
  onSelect: (article: Article) => void;
  emptyMessage?: string;
};

export function ArticleFeed({ articles, onSelect, emptyMessage }: ArticleFeedProps) {
  if (!articles.length) {
    return <p className="text-sm text-zinc-500">{emptyMessage ?? 'No articles to display yet.'}</p>;
  }

  return (
    <div className="space-y-8">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onSelect={() => onSelect(article)} />
      ))}
    </div>
  );
}
