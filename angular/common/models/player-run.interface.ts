import { Player } from '@common/models/player.interface';
import { TimedArticle } from '@common/models/timed-article.interface';

export interface PlayerRun extends Player {
  articles: TimedArticle[];
  time: { start: number; end: number };
}
