import { Component, inject, OnInit, signal } from '@angular/core';
import { ContactService } from '../../services/contact-service';
import { IUser } from '../../interfaces/iuser';
import { Namelist } from './namelist/namelist';
import { MainView } from './main-view/main-view';
import { AddContact } from './add-contact/add-contact';

@Component({
  selector: 'app-content-contacts',
  imports: [Namelist, MainView, AddContact],
  templateUrl: './content-contacts.html',
  styleUrl: './content-contacts.scss',
})
export class ContentContacts implements OnInit {
  readonly contactService = inject(ContactService);

  // Speichert den angeklickten Kontakt für die rechte Kontaktkarte.
  // null bedeutet: Es ist noch kein Kontakt ausgewählt.
  readonly selectedContact = signal<IUser | null>(null);

  /**
   * Wird beim Öffnen der Kontaktseite ausgeführt.
   * Startet das Laden der Kontakte.
   */
  ngOnInit(): void {
    void this.contactService.getUsers();
  }
}