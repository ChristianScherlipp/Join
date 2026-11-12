import {
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  afterRenderEffect,
  ElementRef,
} from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

// Beschreibt eine Buchstabengruppe in der Kontaktliste.
interface ContactGroup {
  letter: string;
  contacts: IUser[];
}

@Component({
  selector: 'app-namelist',
  imports: [InitialIcon],
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

private readonly element: ElementRef<HTMLElement> = inject(ElementRef);

  constructor() {
    // Wird nach dem Rendern ausgeführt, wenn sich Auswahl oder Liste ändern.
    afterRenderEffect(() => {
      const id = this.selectedId();
      this.contacts();
      const loading = this.loading();

      if (id === null || loading) {
        return;
      }

      this.scrollToContact(id);
    });
  }

  /**
   * Verschiebt nur den Scrollbereich der Kontaktliste.
   */
  private scrollToContact(id: number): void {
    const host = this.element.nativeElement;

    // Mobil ist die Liste bei geöffneter Kontaktkarte ausgeblendet.
    if (host.getClientRects().length === 0) {
      return;
    }

    const list = host.querySelector<HTMLElement>('.list-scroll');
    const button = host.querySelector<HTMLElement>(
      `[data-contact-id="${id}"]`
    );

    if (!list || !button) {
      return;
    }

    const listBounds = list.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();

    // Ist der Kontakt bereits vollständig sichtbar, bleibt die Liste stehen.
    if (
      buttonBounds.top >= listBounds.top &&
      buttonBounds.bottom <= listBounds.bottom
    ) {
      return;
    }

    list.scrollTo({
      top:
        list.scrollTop +
        buttonBounds.top -
        listBounds.top -
        list.clientHeight / 2 +
        buttonBounds.height / 2,
      behavior: 'smooth',
    });
  }
}