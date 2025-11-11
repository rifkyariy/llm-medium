export type ArticleSection = {
  heading: string;
  body: string;
};

export type ArticleComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  role: 'user' | 'assistant';
};

export type Article = {
  id: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  sections: ArticleSection[];
  createdAt: string;
  readingTimeMinutes?: number;
  imageUrl?: string;
  comments?: ArticleComment[];
};
