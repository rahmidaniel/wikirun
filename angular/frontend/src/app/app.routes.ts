import { Routes } from '@angular/router';

import { AppRoutes } from '../shared/utils/routes';

export const routes: Routes = [
  {
    path: AppRoutes.home,
    loadComponent: () => import('../home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'lobby/:code',
    loadComponent: () => import('../lobby/lobby.component').then((m) => m.LobbyComponent),
  },
  {
    path: AppRoutes.game,
    loadComponent: () => import('../game/game.component').then((m) => m.GameComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
