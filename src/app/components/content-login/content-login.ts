import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { Login } from './login/login';
import { Signup } from './signup/signup';

// Remembers the intro until the browser page is reloaded.
let loginIntroShown = false;

@Component({
  imports: [ButtonPrimary, Login, Signup, RouterLink],
  selector: 'app-content-login',
  styleUrl: './content-login.scss',
  templateUrl: './content-login.html',
})
export class ContentLogin {
  private readonly route = inject(ActivatedRoute);

  readonly isSignup = toSignal(
    this.route.data.pipe(map(data => !!data['signup'])),
    {
      initialValue: !!this.route.snapshot.data['signup'],
    }
  );

  // Only plays when entering the login page for the first time.
  readonly playIntro =
    !this.route.snapshot.data['signup'] && !loginIntroShown;

  constructor() {
    loginIntroShown = true;
  }
}