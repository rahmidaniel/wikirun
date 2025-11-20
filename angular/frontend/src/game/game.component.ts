import { Component, inject } from '@angular/core';

import { GameState } from '@common';

import { ArticleViewerComponent } from '../article-viewer/article-viewer.component';
import { GraphViewerComponent } from '../graph-viewer/graph-viewer.component';
import { GameStateService } from '../shared/services/game-state.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [SidebarComponent, ArticleViewerComponent, GraphViewerComponent],
  host: { class: 'flex flex-grow h-full w-full' },
  templateUrl: './game.component.html',
})
export class GameComponent {
  readonly gameStateService = inject(GameStateService);
  protected readonly GameState = GameState;
}
