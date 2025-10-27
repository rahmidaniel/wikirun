import { Lobby } from './lobby.interface';
import { Player } from './player.interface';

export interface LobbyResponse extends Lobby {
  players: Player[];
}
