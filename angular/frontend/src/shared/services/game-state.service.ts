import { computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { AppState, Article, ArticleResult, TimedArticle } from '@common/models';

import { of, switchMap, tap } from 'rxjs';

import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  private readonly apiService = inject(ApiService);
  readonly state = signal<AppState>(AppState.MENU);

  startArticle = signal<Article | undefined>(undefined);
  endArticle = signal<Article | undefined>(undefined);

  readonly isReady = computed(() => {
    const startArticle = this.startArticle();
    const endArticle = this.endArticle();

    if (startArticle && endArticle) {
      return startArticle.title !== endArticle.title;
    }

    return false;
  });

  readonly progressTable = computed<TimedArticle[]>(() => []);

  readonly currentArticle = signal<Article | undefined>(undefined);

  readonly currentArticleResult = toSignal<ArticleResult | undefined>(
    toObservable(this.currentArticle).pipe(
      switchMap((article) => (article ? this.apiService.getArticle(article.title) : of(undefined))),
      tap(console.log)
    ),
    { initialValue: undefined }
  );

  onStart(): void {
    //   todo send to backend, start for everyone
    this.state.set(AppState.STARTED);
    this.currentArticle.set(this.startArticle());
  }

  updateArticle(article: Article) {
    this.currentArticle.set(article);
  }

  onReset() {}
}
