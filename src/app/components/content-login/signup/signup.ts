import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonBack } from '../../elements/button-back/button-back';

@Component({
  imports: [ButtonPrimary, ButtonBack],
  selector: 'app-signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
})
export class Signup {}
