import { Component, signal } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { Login } from './login/login';
import { Signup } from './signup/signup';
import { RouterLink } from '@angular/router';

/**
 *  Page frame of the login area with the logo, the sign up button and the login window and the links to the legal pages.
 */
@Component({
  imports: [ButtonPrimary, Login,  Signup, RouterLink],
  selector: 'app-content-login',
  styleUrl: './content-login.scss',
  templateUrl: './content-login.html',
})
export class ContentLogin {
  /**True while the sign up window is shown instead of the login window. */
  readonly isSignup = signal(false);

  /**
   * Replaces the login window with the sign up window.
   * 
   * @returns {void}
   */
  showSignup(): void {
    this.isSignup.set(true);
  }

  /**
   * Replaces the sign up with the login window.
   * 
   * @return {void}
   */
  showLogin(): void {
    this.isSignup.set(false);
  }
}
