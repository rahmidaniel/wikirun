import { Component, inject } from '@angular/core';

import { AppState } from '@common';

import { ArticleViewerComponent } from '../article-viewer/article-viewer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { GameStateService } from '../shared/services/game-state.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, SidebarComponent, ArticleViewerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly gameStateService = inject(GameStateService);
  protected readonly AppState = AppState;
}
