import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, DestroyRef, ElementRef, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { Article, GameState } from '@common/models';

import { filter, tap } from 'rxjs';

import { ArticleSearchBoxComponent } from '../article-searchbox/article-search-box.component';
import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-sidebar',
  imports: [NgTemplateOutlet, FormsModule, ArticleSearchBoxComponent, DatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly AppState = GameState;
  protected readonly gameStateService = inject(GameStateService);
  protected readonly destroyRef = inject(DestroyRef);

  private readonly tableRef = contentChild<ElementRef<HTMLDivElement>>('tableRef');
  private readonly tableChange$ = toObservable(this.gameStateService.articleHistory).pipe(
    filter((table) => !!table.length),
    tap(() => {
      console.log('sidebar scroll');
      this.tableRef()?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  constructor() {
    this.tableChange$.subscribe();
    this.gameStateService.onConnect();
  }

  onStartArticleSelected(article: Article) {
    this.gameStateService.setStartArticle(article);
  }

  onEndArticleSelected(article: Article) {
    this.gameStateService.setEndArticle(article);
  }
}
