import { Component } from '@angular/core';
import { InitialIcon } from '../elements/initial-icon/initial-icon';


@Component({
  imports: [InitialIcon],
  selector: 'app-header',
  styleUrl: './header.scss',
  templateUrl: './header.html',
})
export class Header {}
