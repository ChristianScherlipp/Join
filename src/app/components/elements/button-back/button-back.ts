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
  private readonly router = inject(Router)

  readonly widthStr = input<string>('2rem');
  readonly heightStr = input<string>('2rem');
  //Ziel, wenn es keine vorherige Seite im Verlauf gibt (z.B. nach Reload).
  readonly fallbackUrl = input<string>('/contacts'); // Wenn Summary fertig ist hier ('/contacts') in ('/summary') ändern
  readonly iconSrc = './assets/icons/arrow-back.svg';

  //Geht zur vorherigen Ansicht zurück, sonst zur Fallbackseite.
  goBack(): void {
    if (this.hasHistory()) {
      this.location.back();
    } else {
      void this.router.navigateByUrl(this.fallbackUrl());
    }
  }

  //Angular zähhlt die Navigation mit; ab 2 gibt es eine vorherige Seite
  private hasHistory(): boolean {
    return history.state?.navigationId > 1;
  }
}
