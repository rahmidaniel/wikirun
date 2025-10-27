import { GameState } from '@common/models/app-state.enum';
import { Article } from '@common/models/article.interface';

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  status: GameState;
  playerIds: string[];
  articles?: { start: Article; end: Article };
  startedAt?: number;
}
