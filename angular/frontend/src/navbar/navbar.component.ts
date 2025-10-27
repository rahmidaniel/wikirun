import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { GameState } from '@common/models';

import { GameStateService } from '../shared/services/game-state.service';
import { AppRoutes } from '../shared/utils/routes';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly router = inject(Router);

  protected readonly AppRoutes = AppRoutes;

  onHomeClick(event: MouseEvent): boolean {
    const currentState = this.gameStateService.state();

    if (currentState === GameState.IN_GAME || currentState === GameState.WAITING) {
      event.preventDefault();
      const confirmed = confirm(
        'You have a game in progress. Leaving now will end your current game. Are you sure you want to continue?'
      );

      if (confirmed) {
        this.gameStateService.reset();
        this.router.navigate([AppRoutes.home]);
      }

      return false;
    }

    return true;
  }
}
