import { Article } from './article.interface';

export interface ArticleResult extends Article {
  html: string;
}
