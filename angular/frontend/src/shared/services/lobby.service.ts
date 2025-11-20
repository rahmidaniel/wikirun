import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Article, LobbyResponse } from '@common/models';

import { firstValueFrom } from 'rxjs';

import { ApiService } from './api.service';
import { SocketService } from './socket.service';

@Injectable({
  providedIn: 'root',
})
export class LobbyService {
  private readonly apiService = inject(ApiService);
  private readonly socketService = inject(SocketService);
  private readonly destroyRef = inject(DestroyRef);

  readonly lobby = signal<LobbyResponse | undefined>(undefined);
  readonly currentPlayerId = signal<string | undefined>(undefined);

  readonly currentPlayer = computed(() => {
    const playerId = this.currentPlayerId();
    const lobbyData = this.lobby();
    if (!playerId || !lobbyData) {
      return undefined;
    }

    return lobbyData.players.find((p) => p.id === playerId);
  });

  readonly isHost = computed(() => {
    const lobbyData = this.lobby();
    const playerId = this.currentPlayerId();
    return lobbyData && playerId && lobbyData.hostId === playerId;
  });

  readonly lobbyCode = computed(() => this.lobby()?.code);

  readonly players = computed(() => this.lobby()?.players ?? []);

  readonly lobbyUpdated$ = this.socketService.lobbyUpdated$;
  readonly gameStarted$ = this.socketService.gameStarted$;
  readonly gameEnded$ = this.socketService.gameEnded$;
  readonly error$ = this.socketService.error$;

  private subscriptionsInitialized = false;

  private setupSubscriptions(): void {
    if (this.subscriptionsInitialized) {
      return;
    }
    this.subscriptionsInitialized = true;

    this.lobbyUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lobbyData) => {
      this.lobby.set(lobbyData);
    });

    this.error$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => {
      console.error('Lobby error:', error.message);
    });
  }

  async createLobby(): Promise<void> {
    const lobbyData = await firstValueFrom(this.apiService.createLobby());

    this.lobby.set(lobbyData);
    this.currentPlayerId.set(lobbyData.hostId);

    this.socketService.connect();
    this.socketService.joinLobby(lobbyData.code, lobbyData.hostId);

    this.setupSubscriptions();
  }

  async joinLobby(code: string): Promise<void> {
    const lobbyData = await firstValueFrom(this.apiService.joinLobby(code));

    this.lobby.set(lobbyData);
    const newPlayer = lobbyData.players[lobbyData.players.length - 1];
    this.currentPlayerId.set(newPlayer.id);

    this.socketService.connect();
    this.socketService.joinLobby(code, newPlayer.id);

    this.setupSubscriptions();
  }

  setArticles(startArticle?: Article, endArticle?: Article): void {
    const code = this.lobbyCode();
    if (!code) {
      return;
    }

    this.socketService.setArticles(code, startArticle, endArticle);
  }

  startGame(): void {
    const code = this.lobbyCode();
    if (!code) {
      return;
    }

    this.socketService.startGame(code);
  }

  sendArticleVisit(article: Article, timestamp: number): void {
    this.socketService.sendArticleVisit(this.currentPlayerId()!, article, timestamp);
  }

  updatePlayerName(name: string): void {
    this.socketService.updatePlayerName(this.currentPlayerId()!, name);
  }

  leaveLobby(): void {
    const code = this.lobbyCode();
    const playerId = this.currentPlayerId();

    if (code && playerId) {
      this.socketService.leaveLobby(code, playerId);
    }

    this.reset();
  }

  reset(): void {
    this.socketService.disconnect();
    this.lobby.set(undefined);
    this.currentPlayerId.set(undefined);
  }
}
