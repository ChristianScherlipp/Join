import { Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Back button navigating via the history or a fallback address.
 *
 * @example
 * <app-button-back widthStr="2rem" heightStr="2rem" fallbackUrl="/login" />
 */
@Component({
  imports: [],
  selector: 'app-button-back',
  styleUrl: './button-back.scss',
  templateUrl: './button-back.html',
})
export class ButtonBack {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  readonly widthStr = input<string>('2rem');
  readonly heightStr = input<string>('2rem');

  /** Address to navigate to when there is no history. */
  readonly fallbackUrl = input<string>('/contacts');
  readonly iconSrc = './assets/icons/arrow-back.svg';

  /** If false, the using component handles the click action. */
  readonly useHistory = input<boolean>(true);

  /**
   * Navigates back if history navigation is enabled.
   *
   * @returns {void}
   */
  goBack(): void {
    if (!this.useHistory()) {
      return;
    }

    if (this.hasHistory()) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.fallbackUrl());
    }
  }

  /**
   * Checks the Angular navigation ID used so far.
   * This check does not guarantee that the previous target is internal.
   *
   * @returns {boolean} true if more than one navigation has already happened.
   */
  private hasHistory(): boolean {
    return history.state?.navigationId > 1;
  }
}
