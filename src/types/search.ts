export type SearchSuggestion = {
  id: string;
  title: string;
  description?: string;
  action: 'generate' | 'compose';
  payload: {
    code: string;
    guidance: string;
  };
};
