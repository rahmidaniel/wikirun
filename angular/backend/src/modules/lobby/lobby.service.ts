import { Injectable, Logger } from '@nestjs/common';

import { Article, GameResult, GameState, Lobby, LobbyResponse, Player, PlayerRun } from '@common';
import chroma from 'chroma-js';
import { nanoid } from 'nanoid';

import { AlgorithmService } from '../algorithm/algorithm.service';
import { DBService } from '../db/db.service';

@Injectable()
export class LobbyService {
  private readonly logger = new Logger(LobbyService.name);

  constructor(
    private readonly dbService: DBService,
    private readonly algorithmService: AlgorithmService
  ) {}

  private toLobbyResponse(lobby: Lobby): LobbyResponse {
    return {
      ...lobby,
      players: this.dbService.getPlayersForLobby(lobby.code),
    };
  }

  create(): LobbyResponse {
    const code = nanoid(10);
    const hostId = crypto.randomUUID();

    const lobby = this.dbService.createLobby({
      id: crypto.randomUUID(),
      code,
      hostId,
      status: GameState.WAITING,
      playerIds: [hostId],
    });

    this.dbService.createPlayer({
      id: hostId,
      name: `Player ${lobby.playerIds.length}`,
      socketId: undefined,
      lobbyId: code,
      color: chroma.random().hex('rgba'),
    });

    return this.toLobbyResponse(lobby);
  }

  join(code: string): LobbyResponse | undefined {
    const lobby = this.dbService.getLobbyByCode(code);

    if (!lobby) {
      this.logger.warn(`Lobby not found: ${code}`);
      return undefined;
    }

    if (lobby.status !== GameState.WAITING) {
      this.logger.warn(`Cannot join lobby ${code}: game already in progress`);
      return undefined;
    }

    const playerId = crypto.randomUUID();

    lobby.playerIds.push(playerId);
    this.dbService.updateLobby(lobby);

    this.dbService.createPlayer({
      id: playerId,
      name: `Player ${lobby.playerIds.length}`,
      socketId: undefined,
      lobbyId: code,
      color: chroma.random().hex('rgba'),
    });

    return this.toLobbyResponse(lobby);
  }

  removePlayer(lobbyCode: string, playerId: string): Lobby | undefined {
    const lobby = this.dbService.getLobbyByCode(lobbyCode);
    if (!lobby) {
      return undefined;
    }

    lobby.playerIds = lobby.playerIds.filter((id) => id !== playerId);
    this.dbService.deletePlayer(playerId);

    if (lobby.playerIds.length === 0) {
      this.dbService.deleteLobby(lobbyCode);
      return undefined;
    }

    if (lobby.hostId === playerId) {
      lobby.hostId = lobby.playerIds[0];
      this.logger.log(`Host reassigned in lobby ${lobbyCode} to player ${lobby.hostId}`);
    }

    this.dbService.updateLobby(lobby);
    return lobby;
  }

  updatePlayerSocket(playerId: string, socketId: string): void {
    const player = this.dbService.getPlayerById(playerId);
    if (!player) {
      return;
    }

    player.socketId = socketId;
    this.dbService.updatePlayer(player);
  }

  updatePlayerName(playerId: string, name: string): Lobby | undefined {
    const player = this.dbService.getPlayerById(playerId);
    if (!player?.lobbyId) {
      return undefined;
    }

    player.name = name;
    this.dbService.updatePlayer(player);

    return this.dbService.getLobbyByCode(player.lobbyId);
  }

  setArticles(lobbyCode: string, hostId: string, startArticle: Article, endArticle: Article): Lobby | undefined {
    const lobby = this.dbService.getLobbyByCode(lobbyCode);
    if (!lobby || lobby.hostId !== hostId) {
      return undefined;
    }

    lobby.articles = { start: startArticle, end: endArticle };
    this.dbService.updateLobby(lobby);

    return lobby;
  }

  startGame(lobbyCode: string, hostId: string): Lobby | undefined {
    const lobby = this.dbService.getLobbyByCode(lobbyCode);
    if (!lobby || lobby.hostId !== hostId) {
      return undefined;
    }

    const start = Date.now();
    lobby.status = GameState.IN_GAME;
    lobby.startedAt = start;
    this.dbService.updateLobby(lobby);

    void this.algorithmService.startPathFinding(lobbyCode, lobby.articles!.start, lobby.articles!.end);

    lobby.playerIds.forEach((playerId) => {
      const player = this.dbService.getPlayerById(playerId)!;
      this.dbService.updatePlayerRun({
        ...player,
        articles: [{ ...lobby.articles!.start, time: start }],
        time: { start, end: 0 },
      });
    });

    return lobby;
  }

  trackArticleVisit(
    playerId: string,
    lobbyCode: string,
    article: Article
  ): { playerRun: PlayerRun; isWinner: boolean } | undefined {
    const lobby = this.dbService.getLobbyByCode(lobbyCode);
    if (!lobby || lobby.status !== GameState.IN_GAME) {
      return undefined;
    }

    const playerRun = this.dbService.getPlayerRun(playerId, lobbyCode)!;

    playerRun.articles.push({
      ...article,
      time: Date.now(),
    });
    this.dbService.updatePlayerRun(playerRun);

    const isWinner = article.title === lobby.articles?.end.title;

    return { playerRun, isWinner };
  }

  async endGame(lobbyCode: string, winnerId: string): Promise<GameResult> {
    const lobby = this.dbService.getLobbyByCode(lobbyCode)!;
    const endTime = Date.now();

    lobby.status = GameState.RESULTS;
    this.dbService.updateLobby(lobby);

    const playerRun = this.dbService.getPlayerRun(winnerId, lobbyCode)!;

    const winner = this.dbService.updatePlayerRun({ ...playerRun, time: { ...playerRun.time, end: endTime } });
    const playerRuns = this.calculatePlayerOrder(this.dbService.getPlayerRunsForLobby(lobbyCode));
    const optimalPathResult = await this.algorithmService.getResult(lobbyCode);

    return {
      winner,
      optimalPathResult,
      playerRuns,
    };
  }

  getLobby(lobbyCode: string): Lobby | undefined {
    return this.dbService.getLobbyByCode(lobbyCode);
  }

  getPlayers(lobbyCode: string): Player[] {
    return this.dbService.getPlayersForLobby(lobbyCode);
  }

  private calculatePlayerOrder(playerRuns: PlayerRun[]) {
    return playerRuns.sort((a, b) => {
      const aDone = a.time.end > 0;
      const bDone = b.time.end > 0;

      if (aDone && !bDone) {
        return -1;
      }
      if (!aDone && bDone) {
        return 1;
      }

      if (aDone && bDone) {
        return a.time.end - a.time.start - (b.time.end - b.time.start);
      }

      return b.articles.length - a.articles.length;
    });
  }
}
