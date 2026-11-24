import { Component } from '@angular/core';
import { ButtonPrimary } from '../elements/button-primary/button-primary';
import { Login } from './login/login';
import { RouterLink } from '@angular/router';

/**
 *  Page frame of the login area with the logo, the sign up button and the login window and the links to the legal pages.
 */
@Component({
  imports: [ButtonPrimary, Login, RouterLink],
  selector: 'app-content-login',
  styleUrl: './content-login.scss',
  templateUrl: './content-login.html',
})
export class ContentLogin {}
