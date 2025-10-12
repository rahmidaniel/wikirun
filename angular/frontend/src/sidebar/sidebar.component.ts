import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, DestroyRef, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { AppState, Article } from '@common/models';

import { filter, tap } from 'rxjs';

import { ArticleSearchBoxComponent } from '../article-searchbox/article-search-box.component';
import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-sidebar',
  imports: [NgTemplateOutlet, FormsModule, ArticleSearchBoxComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly AppState = AppState;
  protected readonly gameStateService = inject(GameStateService);
  protected readonly destroyRef = inject(DestroyRef);

  private readonly tableRef = contentChild<ElementRef<HTMLDivElement>>('tableRef');
  private readonly tableChange$ = toObservable(this.gameStateService.progressTable).pipe(
    filter((table) => !!table.length),
    tap(() => {
      console.log('sidebar scroll');
      this.tableRef()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  constructor() {
    this.tableChange$.subscribe();
  }

  onStartArticleSelected(article: Article) {
    this.gameStateService.startArticle.set(article);
  }

  onEndArticleSelected(article: Article) {
    this.gameStateService.endArticle.set(article);
  }
}
