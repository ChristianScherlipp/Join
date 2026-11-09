import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ContactService } from '../../services/contact-service';
import { Namelist } from './namelist/namelist';
import { MainView } from './main-view/main-view';
import { AddContact } from './add-contact/add-contact';
import { EditContact } from './edit-contact/edit-contact';
import { IUser } from '../../interfaces/iuser';
import { ButtonBack } from '../elements/button-back/button-back';

@Component({
  selector: 'app-content-contacts',
  imports: [Namelist, MainView, AddContact, EditContact, ButtonBack],
  templateUrl: './content-contacts.html',
  styleUrl: './content-contacts.scss',
})
export class ContentContacts implements OnInit, OnDestroy {
  readonly contactService = inject(ContactService);

  // Speichert den ausgewählten Kontakt für die Kontaktkarte und den Edit-Dialog.
  readonly selectedContact = signal<IUser | null>(null);

  /**
   * Wird beim Öffnen der Kontaktseite ausgeführt.
   * Startet das Laden der Kontakte.
   */
  ngOnInit(): void {
    void this.contactService.getUsers();
    this.contactService.subscribeToContacts();
  }

  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContacts();
  }

  async deleteSelected(): Promise<void> {
    const contact = this.selectedContact();

    // Verhindert Löschen ohne Auswahl und mehrfache Klicks beim Speichern.
    if (!contact || this.contactService.saving()) {
      return;
    }

    const deleted = await this.contactService.deleteContact(contact.id);

    // Auswahl nur zurücksetzen, wenn weiterhin derselbe Kontakt geöffnet ist.
    if (deleted && this.selectedContact()?.id === contact.id) {
      this.selectedContact.set(null);
    }
  }
}