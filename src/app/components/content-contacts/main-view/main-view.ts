import { Component, input } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';

@Component({
  selector: 'app-main-view',
  imports: [],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView {
  readonly contact = input<IUser | null>(null);

  getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2)
      .map((part) => part.charAt(0)).join('').toUpperCase();
  }

  getColor(name: string): string {
    const colors = [
      '#FF7A00', '#9327FF', '#6E52FF',
      '#FC71FF', '#00BEE8', '#1FD7C1', '#FF4646',
    ];

    let hash = 0;

    for (const character of name) {
      hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    }

    return colors[hash % colors.length];
  }
}