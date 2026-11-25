import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonBack } from '../../elements/button-back/button-back';

/**
 * Sign up window. The back button leads to the login window.
 */
@Component({
  imports: [ButtonPrimary, ButtonBack, RouterLink],
  selector: 'app-signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
})
export class Signup {}
