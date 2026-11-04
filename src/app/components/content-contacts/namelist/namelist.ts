import {
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';

// Beschreibt eine Buchstabengruppe in der Kontaktliste.
interface ContactGroup {
  letter: string;
  contacts: IUser[];
}

@Component({
  selector: 'app-namelist',
  imports: [],
  templateUrl: './namelist.html',
  styleUrl: './namelist.scss',
})
export class Namelist {
  readonly avatar: ContactAvatar = inject(ContactAvatar);

  // Diese Werte kommen von der Hauptkomponente.
  readonly contacts = input.required<IUser[]>();
  readonly loading = input(false);
  readonly selectedId = input<number | null>(null);

  // Diese Ereignisse werden an die Hauptkomponente zurückgemeldet.
  readonly contactSelected = output<IUser>();
  readonly addRequested = output<void>();

  // Berechnet die Gruppen neu, wenn sich die Kontaktliste verändert.
  readonly groups = computed(() => this.groupContacts());

  /**
   * Ordnet die bereits sortierten Kontakte nach Anfangsbuchstaben.
   */
  private groupContacts(): ContactGroup[] {
    const groups: ContactGroup[] = [];

    for (const contact of this.contacts()) {
      const letter =
        contact.name.trim().charAt(0).toLocaleUpperCase('de') || '#';

      // Sucht eine bereits vorhandene Gruppe.
      let group = groups.find((entry) => entry.letter === letter);

      // Erstellt die Gruppe, wenn sie noch nicht vorhanden ist.
      if (!group) {
        group = {
          letter: letter,
          contacts: [],
        };

        groups.push(group);
      }

      // Fügt den Kontakt seiner Buchstabengruppe hinzu.
      group.contacts.push(contact);
    }

    return groups;
  }
}