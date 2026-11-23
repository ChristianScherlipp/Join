import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ContactService } from '../../services/contact-service';
import { Namelist } from './namelist/namelist';
import { MainView } from './main-view/main-view';
import { AddContact } from './add-contact/add-contact';
import { EditContact } from './edit-contact/edit-contact';
import { ButtonBack } from '../elements/button-back/button-back';
import { ToastSuccess } from '../elements/toast-succsess/toast-succsess';

/**
 * Contacts page: connects contact list, contact card and dialogs.
 */
@Component({
  selector: 'app-content-contacts',
  imports: [Namelist, MainView, AddContact, EditContact, ButtonBack, ToastSuccess],
  templateUrl: './content-contacts.html',
  styleUrl: './content-contacts.scss',
})
export class ContentContacts implements OnInit, OnDestroy {
  readonly contactService = inject(ContactService);

  /** The selected contact for the contact card and the edit dialog. */
  readonly selectedContact = this.contactService.selectedContact;

  /**
   * Loads the contacts when the page opens and starts the live connection.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    void this.contactService.getUsers();
    this.contactService.subscribeToContacts();
  }

  /**
   * Ends the live connection when leaving the page.
   *
   * @returns {void}
   */
  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContacts();
  }

  /**
   * Deletes the selected contact.
   * Nothing happens without a selection or while saving.
   *
   * @returns {Promise<void>}
   */
  async deleteSelected(): Promise<void> {
    const contact = this.selectedContact();

    if (!contact || this.contactService.saving()) {
      return;
    }

    const deleted = await this.contactService.deleteContact(contact.id);

    if (deleted && this.selectedContact()?.id === contact.id) {
      this.selectedContact.set(null);
    }
  }
}
