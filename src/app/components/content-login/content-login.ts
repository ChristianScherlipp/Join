import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { Login } from './login/login';
import { Signup } from './signup/signup';

/**
 *  Page frame of the login area with the logo, the sign up button and the login window and the links to the legal pages.
 *  shows the login window on/login and the sign up window on /signup
 */
@Component({
  imports: [ButtonPrimary, Login, Signup, RouterLink],
  selector: 'app-content-login',
  styleUrl: './content-login.scss',
  templateUrl: './content-login.html',
})
export class ContentLogin {
  private readonly route = inject(ActivatedRoute);

  /**
   * True on the route /signup, read from the route data.
   */
  readonly isSignup = toSignal(this.route.data.pipe(map((data) => !!data['signup'])), {
    initialValue: false,
  });
}
