import { Injectable } from '@nestjs/common';

import { Lobby, Player, PlayerRun } from '@common';

@Injectable()
export class DBService {
  private lobbies = new Map<string, Lobby>();
  private players = new Map<string, Player>();
  private playerRuns = new Map<string, PlayerRun>();

  createLobby(lobby: Lobby): Lobby {
    this.lobbies.set(lobby.code, lobby);
    return lobby;
  }

  getLobbyByCode(code: string): Lobby | undefined {
    return this.lobbies.get(code);
  }

  updateLobby(lobby: Lobby): Lobby {
    this.lobbies.set(lobby.code, lobby);
    return lobby;
  }

  deleteLobby(code: string): boolean {
    return this.lobbies.delete(code);
  }

  createPlayer(player: Player): Player {
    this.players.set(player.id, player);
    return player;
  }

  getPlayerById(id: string): Player | undefined {
    return this.players.get(id);
  }

  updatePlayer(player: Player): Player {
    this.players.set(player.id, player);
    return player;
  }

  deletePlayer(id: string): boolean {
    return this.players.delete(id);
  }

  getPlayersForLobby(lobbyCode: string): Player[] {
    const lobby = this.getLobbyByCode(lobbyCode);
    return (lobby?.playerIds ?? []).map((id) => this.players.get(id)!).filter(Boolean);
  }

  getPlayerRun(id: string, lobbyId: string): PlayerRun | undefined {
    return this.playerRuns.get(this.getRunKey({ lobbyId, id }));
  }

  updatePlayerRun(run: PlayerRun): PlayerRun {
    this.playerRuns.set(this.getRunKey(run), run);
    return run;
  }

  getPlayerRunsForLobby(lobbyId: string): PlayerRun[] {
    const runs: PlayerRun[] = [];
    this.playerRuns.forEach((run) => {
      if (run.lobbyId === lobbyId) {
        runs.push(run);
      }
    });
    return runs;
  }

  private getRunKey(run: Pick<Player, 'lobbyId' | 'id'>): string {
    return `${run.lobbyId}:${run.id}`;
  }
}
