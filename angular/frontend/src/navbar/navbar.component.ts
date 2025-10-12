import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppRoutes } from '../shared/utils/routes';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  // todo add guard if game is in progress
  protected readonly AppRoutes = AppRoutes;
}
