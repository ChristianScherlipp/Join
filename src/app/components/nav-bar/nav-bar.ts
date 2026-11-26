import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Supabase } from '../../services/supabase';

/**
 * Navigation with links based on the current authentication state.
 */
@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-nav-bar',
  styleUrl: './nav-bar.scss',
  templateUrl: './nav-bar.html',
})
export class NavBar {
  private readonly supabase = inject(Supabase);

  // References the shared authentication signals.
  readonly isLoggedIn = this.supabase.isLoggedIn;
  readonly authReady = this.supabase.authReady;
}