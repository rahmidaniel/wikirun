import { Injectable } from '@angular/core';

import { Article, GameResult, Lobby, LobbyResponse } from '@common/models';

import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket?: Socket;

  lobbyUpdated$ = new Subject<LobbyResponse>();
  gameStarted$ = new Subject<Lobby>();
  gameEnded$ = new Subject<GameResult>();
  error$ = new Subject<{ message: string }>();

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(`${environment.apiUrl}/game`);

    this.socket.on('lobby-updated', (data: LobbyResponse) => this.lobbyUpdated$.next(data));
    this.socket.on('game-started', (data: Lobby) => this.gameStarted$.next(data));
    this.socket.on('game-ended', (data) => this.gameEnded$.next(data));
    this.socket.on('error', (data: { message: string }) => this.error$.next(data));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = undefined;
  }

  joinLobby(code: string, playerId: string): void {
    this.socket?.emit('join-lobby', { code, playerId });
  }

  leaveLobby(code: string, playerId: string): void {
    this.socket?.emit('leave-lobby', { code, playerId });
  }

  setArticles(code: string, startArticle?: Article, endArticle?: Article): void {
    this.socket?.emit('set-articles', { code, startArticle, endArticle });
  }

  startGame(code: string): void {
    this.socket?.emit('start-game', { code });
  }

  sendArticleVisit(playerId: string, article: Article, timestamp: number): void {
    this.socket?.emit('article-visited', { playerId, article, timestamp });
  }

  updatePlayerName(playerId: string, name: string): void {
    this.socket?.emit('update-player-name', { playerId, name });
  }
}
