import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { InitialIcon } from '../elements/initial-icon/initial-icon';
import { Supabase } from '../../services/supabase';

/**
 * Header with user menu.
 */
@Component({
  selector: 'app-header',
  imports: [InitialIcon, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly elementRef: ElementRef<HTMLElement> =
    inject(ElementRef);

  private readonly supabase = inject(Supabase);
  private readonly router = inject(Router);

  // Uses the shared signals instead of creating separate copies.
  readonly isLoggedIn = this.supabase.isLoggedIn;
  readonly userName = this.supabase.userName;
  readonly authReady = this.supabase.authReady;

  readonly isMenuOpen = signal(false);
  readonly loggingOut = signal(false);
  readonly logoutError = signal('');

  /**
   * Opens or closes the user menu.
   */
  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  /**
   * Closes the user menu.
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Closes the menu when clicking outside the header.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target;

    if (
      target instanceof Node &&
      !this.elementRef.nativeElement.contains(target)
    ) {
      this.closeMenu();
    }
  }

  /**
   * Signs out the user and redirects to the login page.
   * Works for both registered users and guests.
   */
  async logout(): Promise<void> {
    if (this.loggingOut()) {
      return;
    }

    this.loggingOut.set(true);
    this.logoutError.set('');

    try {
      const { error } = await this.supabase.signOut();

      if (error) {
        throw error;
      }

      this.closeMenu();

      await this.router.navigateByUrl('/login', {
        replaceUrl: true,
      });
    } catch (error) {
      console.error('Logout fehlgeschlagen:', error);

      this.logoutError.set(
        'Abmelden fehlgeschlagen. Bitte erneut versuchen.'
      );
    } finally {
      this.loggingOut.set(false);
    }
  }
}