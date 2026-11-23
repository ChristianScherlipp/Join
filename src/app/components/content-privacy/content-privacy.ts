import { Component } from '@angular/core';
import { ButtonBack } from '../elements/button-back/button-back';

/**
 * Page with the privacy policy.
 */
@Component({
  imports: [ButtonBack],
  selector: 'app-content-privacy',
  styleUrl: './content-privacy.scss',
  templateUrl: './content-privacy.html',
})
export class ContentPrivacy {}
