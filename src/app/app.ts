import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { NavBar } from './components/nav-bar/nav-bar';
import { Header } from './components/header/header';

/**
 * Root component with navigation, header and the outlet for the pages.
 * Navigation and Header are hidden in the login area.
 */
@Component({
  imports: [Header, RouterOutlet, NavBar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join');

  private readonly router = inject(Router)

  /**The current url, starting with the url of the first page load. */
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url),
    ),
    { initialValue: inject(Location).path() },
  );

  /**True in the login area (start page "/" redirects there), where navigation and header are hidden. */
  protected readonly isLoginArea = computed(() => {
    const path = this.currentUrl().split('?')[0];
    return path === '' || path === '/' || path.startsWith('/login') || path.startsWith('/signup');
  });
}
