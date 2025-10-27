import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { Article, ArticleResult, GameState, Player, PlayerRun, TimedArticle } from '@common/models';

import { of, switchMap } from 'rxjs';

import { ApiService } from './api.service';
import { LobbyService } from './lobby.service';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly apiService = inject(ApiService);
  private readonly lobbyService = inject(LobbyService);
  private readonly destroyRef = inject(DestroyRef);

  readonly state = signal<GameState>(GameState.MENU);

  readonly currentArticle = signal<Article | undefined>(undefined);
  readonly articleHistory = signal<TimedArticle[]>([]);

  readonly startArticle = computed(() => this.lobbyService.lobby()?.articles?.start);
  readonly endArticle = computed(() => this.lobbyService.lobby()?.articles?.end);

  readonly isReady = computed(() => {
    const start = this.startArticle();
    const end = this.endArticle();
    console.log('isReady', start, end);
    return start && end && start.title !== end.title;
  });

  readonly isHost = computed(() => this.lobbyService.isHost());

  readonly gameStartTime = signal<number | undefined>(undefined);
  readonly elapsedTime = signal<number>(0);
  private timerInterval?: NodeJS.Timeout;

  // Tracks real-time progress of all players in multiplayer mode (for future UI display)
  readonly playerProgress = signal<Map<string, { currentArticle: Article; articleCount: number }>>(new Map());

  readonly winner = signal<Player | undefined>(undefined);
  readonly gameResults = signal<PlayerRun[] | undefined>(undefined);
  readonly optimalPath = signal<{ articles: string[]; length: number } | undefined>(undefined);

  readonly currentArticleResult = toSignal<ArticleResult | undefined>(
    toObservable(this.currentArticle).pipe(
      switchMap((article) => (article ? this.apiService.getArticle(article.title) : of(undefined)))
    ),
    { initialValue: undefined }
  );

  async onConnect(): Promise<void> {
    await this.lobbyService.createLobby();

    this.lobbyService.gameStarted$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lobby) => {
      this.handleGameStart(lobby);
    });

    this.lobbyService.playerProgress$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((progress) => {
      this.handlePlayerProgress(progress);
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

  setStartArticle(article: Article): void {
    this.lobbyService.setArticles(article, this.endArticle());
  }

  setEndArticle(article: Article): void {
    this.lobbyService.setArticles(this.startArticle(), article);
  }

  onStart(): void {
    this.lobbyService.startGame();
    this.updateArticle(this.startArticle()!);
  }

  updateArticle(article: Article): void {
    const timestamp = Date.now() - this.elapsedTime();
    this.currentArticle.set(article);
    this.articleHistory.update((history) => [...history, { ...article, time: timestamp }]);

    this.lobbyService.sendArticleVisit(article, timestamp);

    if (article.title === this.endArticle()!.title) {
      this.stopTimer();
    }
  }

  reset(): void {
    this.state.set(GameState.MENU);
    this.currentArticle.set(undefined);
    this.articleHistory.set([]);
    this.gameStartTime.set(undefined);
    this.elapsedTime.set(0);
    this.playerProgress.set(new Map());
    this.gameResults.set(undefined);
    this.winner.set(undefined);
    this.optimalPath.set(undefined);
    this.stopTimer();
  }

  private handleGameStart(lobby: any): void {
    this.state.set(GameState.IN_GAME);
    this.gameStartTime.set(lobby.startedAt);
    this.currentArticle.set(lobby.articles?.start);
    this.articleHistory.set([]);
    this.startTimer();
  }

  private handlePlayerProgress(progress: any): void {
    const progressMap = this.playerProgress();
    progressMap.set(progress.playerId, {
      currentArticle: progress.currentArticle,
      articleCount: progress.articleCount,
    });
    this.playerProgress.set(new Map(progressMap));
  }

  private handleGameEnd(result: any): void {
    this.state.set(GameState.RESULTS);
    this.gameResults.set(result.finalStandings);
    this.winner.set(result.winner);
    this.optimalPath.set(result.optimalPath);
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();

    this.timerInterval = setInterval(() => {
      const startTime = this.gameStartTime();
      if (startTime) {
        this.elapsedTime.set(Date.now() - startTime);
      }
    }, 16);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }
}
