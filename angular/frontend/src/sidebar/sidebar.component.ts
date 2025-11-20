import { DatePipe } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GameState } from '@common/models';

import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-sidebar',
  imports: [FormsModule, DatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly AppState = GameState;
  protected readonly gameStateService = inject(GameStateService);

  readonly hasReachedEnd = computed(() => {
    const endArticle = this.gameStateService.endArticle();
    const articleHistory = this.gameStateService.articleHistory();
    return articleHistory.at(-1)?.title === endArticle?.title;
  });

  private readonly timelineRef = viewChild<ElementRef<HTMLDivElement>>('timelineRef');

  constructor() {
    effect(() => {
      const articleHistory = this.gameStateService.articleHistory();
      const element = this.timelineRef()?.nativeElement;
      if (articleHistory.length > 0 && element) {
        element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' });
      }
    });
  }
}
