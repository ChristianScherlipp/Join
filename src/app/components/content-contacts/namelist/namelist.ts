import { Component, computed, input, output } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';

@Component({
  selector: 'app-namelist',
  imports: [],
  templateUrl: './namelist.html',
  styleUrl: './namelist.scss',
})
export class Namelist {
  readonly contacts = input.required<IUser[]>();
  readonly loading = input(false);
  readonly selectedId = input<number | null>(null);

  readonly contactSelected = output<IUser>();
  readonly addRequested = output<void>();

  readonly groups = computed(() => {
    const groups = new Map<string, IUser[]>();

    for (const contact of this.contacts()) {
      const letter =
        contact.name.trim().charAt(0).toLocaleUpperCase('de') || '#';

      const entries = groups.get(letter) ?? [];
      entries.push(contact);
      groups.set(letter, entries);
    }

    return Array.from(groups, ([letter, contacts]) => ({
      letter,
      contacts,
    }));
  });

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