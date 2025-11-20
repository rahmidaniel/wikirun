import { Article } from '@common/models/article.interface';
import { GameState } from '@common/models/game-state.enum';

export interface Lobby {
  id: string;
  code: string;
  hostId: string;
  status: GameState;
  playerIds: string[];
  articles?: { start: Article; end: Article };
  startedAt?: number;
}
