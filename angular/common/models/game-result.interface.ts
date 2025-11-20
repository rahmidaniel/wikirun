import { PathResult } from '@common/models/path-result.interface';
import { PlayerRun } from '@common/models/player-run.interface';
import { Player } from '@common/models/player.interface';

export interface GameResult {
  winner: Player;
  optimalPathResult?: PathResult;
  playerRuns: PlayerRun[];
}
