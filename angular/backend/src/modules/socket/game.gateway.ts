import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Article } from '@common';
import { Server, Socket } from 'socket.io';

import { LobbyService } from '../lobby/lobby.service';

@WebSocketGateway({ namespace: '/game', cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() io!: Server;

  private readonly logger = new Logger(GameGateway.name);

  // Track which socket is in which lobby for cleanup
  private socketToLobby = new Map<string, string>();
  private socketToPlayer = new Map<string, string>();

  constructor(private readonly lobbyService: LobbyService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    const lobbyCode = this.socketToLobby.get(client.id);
    const playerId = this.socketToPlayer.get(client.id);

    if (lobbyCode && playerId) {
      const lobby = this.lobbyService.removePlayer(lobbyCode, playerId);

      if (lobby) {
        const players = this.lobbyService.getPlayers(lobbyCode);
        this.io.to(lobbyCode).emit('lobby-updated', { ...lobby, players });
      }

      this.socketToLobby.delete(client.id);
      this.socketToPlayer.delete(client.id);
    }
  }

  @SubscribeMessage('join-lobby')
  async handleJoinLobby(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string; playerId: string }) {
    const lobby = this.lobbyService.getLobby(data.code);

    if (!lobby) {
      client.emit('error', { message: 'Lobby not found' });
      return;
    }

    this.lobbyService.updatePlayerSocket(data.playerId, client.id);

    await client.join(data.code);

    this.socketToLobby.set(client.id, data.code);
    this.socketToPlayer.set(client.id, data.playerId);

    const players = this.lobbyService.getPlayers(data.code);
    this.io.to(data.code).emit('lobby-updated', { ...lobby, players });

    this.logger.log(`Player ${data.playerId} joined lobby ${data.code}`);
  }

  @SubscribeMessage('leave-lobby')
  async handleLeaveLobby(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string; playerId: string }) {
    const lobby = this.lobbyService.removePlayer(data.code, data.playerId);

    await client.leave(data.code);

    this.socketToLobby.delete(client.id);
    this.socketToPlayer.delete(client.id);

    if (lobby) {
      const players = this.lobbyService.getPlayers(data.code);
      this.io.to(data.code).emit('lobby-updated', { ...lobby, players });
      this.logger.log(`Player ${data.playerId} left lobby ${data.code}`);
    }
  }

  @SubscribeMessage('set-articles')
  handleSetArticles(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      code: string;
      startArticle: Article;
      endArticle: Article;
    }
  ) {
    const playerId = this.socketToPlayer.get(client.id);
    if (!playerId) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    const lobby = this.lobbyService.setArticles(data.code, playerId, data.startArticle, data.endArticle);

    if (!lobby) {
      client.emit('error', {
        message: 'Failed to set articles. You must be the host.',
      });
      return;
    }

    const players = this.lobbyService.getPlayers(data.code);
    this.io.to(data.code).emit('lobby-updated', { ...lobby, players });
  }

  @SubscribeMessage('start-game')
  handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { code: string }) {
    const playerId = this.socketToPlayer.get(client.id);
    if (!playerId) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    const lobby = this.lobbyService.startGame(data.code, playerId);

    if (!lobby) {
      client.emit('error', {
        message: 'Failed to start game. You must be the host and articles must be set.',
      });
      return;
    }

    this.io.to(data.code).emit('game-started', lobby);
  }

  @SubscribeMessage('article-visited')
  handleArticleVisited(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { playerId: string; article: Article }
  ) {
    const lobbyCode = this.socketToLobby.get(client.id);
    if (!lobbyCode) {
      client.emit('error', { message: 'Not in a lobby' });
      return;
    }

    const result = this.lobbyService.trackArticleVisit(data.playerId, lobbyCode, data.article);

    if (!result) {
      return;
    }

    // todo this can be sent per player too, just to get their current progress
    this.io.to(lobbyCode).emit('player-progress', {
      playerId: data.playerId,
      currentArticle: data.article,
      articleCount: result.playerRun.articles.length,
      isWinner: result.isWinner,
    });

    if (result.isWinner) {
      const endResult = this.lobbyService.endGame(lobbyCode, data.playerId);
      this.io.to(lobbyCode).emit('game-ended', endResult);
    }
  }

  @SubscribeMessage('update-player-name')
  handleUpdatePlayerName(@ConnectedSocket() client: Socket, @MessageBody() data: { playerId: string; name: string }) {
    const lobby = this.lobbyService.updatePlayerName(data.playerId, data.name);

    if (!lobby) {
      client.emit('error', { message: 'Failed to update name' });
      return;
    }

    const players = this.lobbyService.getPlayers(lobby.code);
    this.io.to(lobby.code).emit('lobby-updated', { ...lobby, players });
  }
}
