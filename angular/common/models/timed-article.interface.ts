import { Article } from './article.interface';

export interface TimedArticle extends Article {
  time: number;
}
