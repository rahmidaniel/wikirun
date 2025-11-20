import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { GameStateService } from '../shared/services/game-state.service';
import { LobbyService } from '../shared/services/lobby.service';
import { AppRoutes } from '../shared/utils/routes';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  host: { class: 'h-[100vh] hero' },
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly gameStateService = inject(GameStateService);
  private readonly lobbyService = inject(LobbyService);

  async createLobby() {
    await this.gameStateService.onConnect();
    const lobbyCode = this.lobbyService.lobbyCode();

    if (lobbyCode) {
      void this.router.navigate([AppRoutes.lobby, lobbyCode]);
    }
  }
}
