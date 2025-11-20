import { Component, inject } from '@angular/core';

import { GameState } from '@common/models';

import { GameStateService } from '../shared/services/game-state.service';

@Component({
  selector: 'app-navbar',
  imports: [],
  host: { class: 'navbar bg-base-100 h-16 gap-8 shadow-2xl z-50 rounded-3xl' },
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  protected readonly GameState = GameState;
  protected readonly gameStateService = inject(GameStateService);

  onHomeClick(event: MouseEvent) {
    event.preventDefault();
    const currentState = this.gameStateService.state();

    if (currentState === GameState.IN_GAME || currentState === GameState.WAITING) {
      const confirmed = confirm('Are you sure you want to leave the game?');

      if (confirmed) {
        this.gameStateService.reset();
      }
    }
  }
}
