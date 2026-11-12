import { Location } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

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

  readonly fallbackUrl = input<string>('/contacts');
  readonly iconSrc = './assets/icons/arrow-back.svg';

  // Bei false übernimmt die verwendende Komponente die Klickaktion.
  readonly useHistory = input<boolean>(true);

  /**
   * Navigiert zurück, sofern die Verlaufsnavigation aktiviert ist.
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
   * Prüft die bisher verwendete Angular-Navigationsnummer.
   * Diese Prüfung garantiert nicht, dass das vorherige Ziel intern ist.
   */
  private hasHistory(): boolean {
    return history.state?.navigationId > 1;
  }
}