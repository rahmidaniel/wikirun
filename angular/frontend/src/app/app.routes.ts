import { Routes } from '@angular/router';

import { AppRoutes } from '../shared/utils/routes';

export const routes: Routes = [{ path: AppRoutes.home, loadComponent: () => import('./app').then((m) => m.App) }];
