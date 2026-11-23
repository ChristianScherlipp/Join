import { Component } from '@angular/core';
import { ButtonBack } from '../elements/button-back/button-back';

/**
 * Help page.
 */
@Component({
  imports: [ButtonBack],
  selector: 'app-content-help',
  styleUrl: './content-help.scss',
  templateUrl: './content-help.html',
})
export class ContentHelp {}
