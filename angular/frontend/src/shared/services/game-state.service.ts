import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import {
  Article,
  ArticleResult,
  GameResult,
  GameState,
  Lobby,
  PathResult,
  Player,
  PlayerRun,
  TimedArticle,
} from '@common/models';

import { of, switchMap } from 'rxjs';

import { ApiService } from './api.service';
import { LobbyService } from './lobby.service';
import { AppRoutes } from '../utils/routes';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly apiService = inject(ApiService);
  private readonly lobbyService = inject(LobbyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly state = signal<GameState>(GameState.MENU);

  readonly currentPlayerRun = computed(() =>
    this.gameResults()?.find((run) => run.id === this.lobbyService.currentPlayerId())
  );

  readonly currentArticle = signal<Article | undefined>(undefined);
  readonly articleHistory = signal<TimedArticle[]>([]);

  readonly startArticle = computed(() => this.lobbyService.lobby()?.articles?.start);
  readonly endArticle = computed(() => this.lobbyService.lobby()?.articles?.end);

  readonly isReady = computed(() => {
    const start = this.startArticle();
    const end = this.endArticle();
    return start && end && start.title !== end.title;
  });

  readonly gameStartTime = signal<number | undefined>(undefined);
  readonly elapsedTime = signal<number>(0);
  private timer?: NodeJS.Timeout;

  readonly playerArticleHistories = signal<Map<string, TimedArticle[]>>(new Map());

  readonly winner = signal<Player | undefined>(undefined);
  readonly gameResults = signal<PlayerRun[] | undefined>(undefined);
  readonly optimalPath = signal<PathResult | undefined>(undefined);

  readonly currentArticleResult = toSignal<ArticleResult | undefined>(
    toObservable(this.currentArticle).pipe(
      switchMap((article) => (article ? this.apiService.getArticle(article.title) : of(undefined)))
    ),
    { initialValue: undefined }
  );

  private gameSubscriptionsInitialized = false;

  setupGameSubscriptions(): void {
    if (this.gameSubscriptionsInitialized) {
      return;
    }
    this.gameSubscriptionsInitialized = true;

    this.lobbyService.gameStarted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lobby) => {
      this.handleGameStart(lobby);
    });

    this.lobbyService.gameEnded$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      this.handleGameEnd(result);
    });

    this.lobbyService.lobbyUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lobby) => {
      if (lobby.status === GameState.WAITING && this.state() !== GameState.WAITING) {
        this.state.set(GameState.WAITING);
      }
    });
  }

  async onConnect(): Promise<void> {
    await this.lobbyService.createLobby();
    this.setupGameSubscriptions();
  }

  setStartArticle(article: Article): void {
    this.lobbyService.setArticles(article, this.endArticle());
  }

  setEndArticle(article: Article): void {
    this.lobbyService.setArticles(this.startArticle(), article);
  }

  onStart(): void {
    this.lobbyService.startGame();
  }

  updateArticle(article: Article): void {
    const timestamp = Date.now() - this.gameStartTime()!;
    this.currentArticle.set(article);
    this.articleHistory.update((history) => [...history, { ...article, time: timestamp }]);

    this.lobbyService.sendArticleVisit(article, timestamp);

    if (article.title === this.endArticle()!.title) {
      this.stopTimer();
    }
  }

  reset(): void {
    this.lobbyService.leaveLobby();
    this.state.set(GameState.MENU);
    this.currentArticle.set(undefined);
    this.articleHistory.set([]);
    this.gameStartTime.set(undefined);
    this.elapsedTime.set(0);
    this.playerArticleHistories.set(new Map());
    this.gameResults.set(undefined);
    this.winner.set(undefined);
    this.optimalPath.set(undefined);
    this.stopTimer();

    void this.router.navigate([AppRoutes.home]);
  }

  cheat(): void {
    if (this.state() === GameState.IN_GAME) {
      this.updateArticle(this.endArticle()!);
    }
  }

  private handleGameStart(lobby: Lobby): void {
    this.state.set(GameState.IN_GAME);
    this.gameStartTime.set(lobby.startedAt);

    this.playerArticleHistories.set(new Map());

    this.updateArticle(lobby.articles!.start);
    this.startTimer();
  }

  private handleGameEnd(result: GameResult): void {
    this.stopTimer();
    this.state.set(GameState.RESULTS);
    this.gameResults.set(result.playerRuns);
    this.winner.set(result.winner);
    this.optimalPath.set(result.optimalPathResult);
    this.playerArticleHistories.set(new Map(result.playerRuns.map((run) => [run.id, run.articles])));
  }

  private startTimer(): void {
    this.stopTimer();

    this.timer = setInterval(() => {
      const startTime = this.gameStartTime();
      if (startTime) {
        this.elapsedTime.set(Date.now() - startTime);
      }
    }, 16);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
