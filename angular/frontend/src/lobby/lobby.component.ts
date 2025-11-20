import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { GameState } from '@common/models';

import { map } from 'rxjs';

import { ArticleSearchBoxComponent } from '../article-searchbox/article-search-box.component';
import { GameStateService } from '../shared/services/game-state.service';
import { LobbyService } from '../shared/services/lobby.service';
import { AppRoutes } from '../shared/utils/routes';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [ArticleSearchBoxComponent],
  host: { class: 'flex flex-col p-8 gap-8' },
  templateUrl: './lobby.component.html',
})
export class LobbyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly gameStateService = inject(GameStateService);
  readonly lobbyService = inject(LobbyService);

  readonly routeCode = toSignal(this.route.paramMap.pipe(map((params) => params.get('code'))));
  readonly shareUrl = computed(() => {
    const lobbyCode = this.lobbyService.lobbyCode();
    return lobbyCode ? `${window.location.origin}/lobby/${lobbyCode}` : '';
  });

  showCopiedText = signal(false);
  private joiningCode = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const paramCode = this.routeCode();
      const lobbyCode = this.lobbyService.lobbyCode();
      const joiningCode = this.joiningCode();

      if (paramCode && paramCode !== lobbyCode && paramCode !== joiningCode) {
        void this.joinLobby(paramCode);
      }
    });

    effect(() => {
      if (this.gameStateService.state() === GameState.IN_GAME) {
        void this.router.navigate([AppRoutes.game]);
      }
    });
  }

  async joinLobby(code: string) {
    try {
      this.joiningCode.set(code);
      await this.lobbyService.joinLobby(code);
      this.gameStateService.setupGameSubscriptions();
    } catch {
      this.joiningCode.set(undefined);
      this.gameStateService.reset();
    }
  }

  async copyToClipboard() {
    const url = this.shareUrl();
    await navigator.clipboard.writeText(url);

    this.showCopiedText.set(true);
    setTimeout(() => this.showCopiedText.set(false), 2000);
  }

  updatePlayerName(input: HTMLInputElement) {
    const name = input.value.trim();
    const currentPlayer = this.lobbyService.currentPlayer()!;

    if (!name) {
      input.value = currentPlayer.name;
      return;
    }

    if (name !== currentPlayer.name) {
      this.lobbyService.updatePlayerName(name);
    }

    input.blur();
  }
}
