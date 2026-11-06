import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact-service';
import { Namelist } from './namelist/namelist';
import { MainView } from './main-view/main-view';
import { AddContact } from './add-contact/add-contact';

@Component({
  imports: [Namelist, MainView, AddContact],
  selector: 'app-content-contacts',
  templateUrl: './content-contacts.html',
  styleUrl: './content-contacts.scss',
})
export class ContentContacts implements OnInit, OnDestroy {
  readonly contactService = inject(ContactService);

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

  deleteSelected(): void {
    const contact = this.contactService.selectedContact();
    if (!contact) return;

    void this.contactService.deleteContact(contact.id);
    this.contactService.selectedContact.set(null);
  }
}