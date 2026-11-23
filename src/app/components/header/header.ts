import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { InitialIcon } from '../elements/initial-icon/initial-icon';

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
  private elementRef = inject(ElementRef);

  isMenuOpen = signal(false);

  /**
   * Opens the menu or closes it again.
   *
   * @returns {void}
   */
  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  /**
   * Closes the menu.
   *
   * @returns {void}
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  /**
   * Closes the menu on logout. The logout logic follows later.
   *
   * @returns {void}
   */
  logout(): void {
    this.closeMenu();
  }

  /**
   * Closes the menu when clicking outside the header.
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}
