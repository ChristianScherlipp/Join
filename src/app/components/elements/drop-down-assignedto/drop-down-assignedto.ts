import { Component, ElementRef, HostListener, OnDestroy, OnInit, computed, effect, inject, input, model, signal } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactService } from '../../../services/contact-service';
import { InitialIcon } from '../initial-icon/initial-icon';

// Das Dropdown braucht von einem Kontakt nur id und nam.
type Contact = Pick<IUser, 'id' | 'name'>;

@Component({
  imports: [InitialIcon],
  selector: 'app-drop-down-assignedto',
  styleUrl: './drop-down-assignedto.scss',
  templateUrl: './drop-down-assignedto.html',
})
export class DropDownAssignedto implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly contactService = inject(ContactService);

  // Alle wählbaren Kontakte: dieselbe Liste und Reihenfolge wie in der Kontaktliste.
  readonly contacts = this.contactService.sortedUsers;

  // Ausgewählte Kontakte, per [(selectedContacts)] vom Parent bindbar.
  readonly selectedContacts = model<Contact[]>([]);

  readonly isOpen = signal(false);
  readonly searchText = signal('');

  // Kontakte, deren Name den Suchtext enthält.
  readonly filteredContacts = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    return this.contacts().filter((contact) => contact.name.toLowerCase().includes(term));
  });

  constructor() {
    effect(() => this.removeDeletedFromSelection());
  }

  //Lädt die Kontakte frisch und hält sie per Live-Verbindung 
  ngOnInit(): void {
    void this.contactService.getUsers();
    this.contactService.subscribeToContacts();
  }

  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContacts();
  }

  isSelected(contact: Contact): boolean {
    return this.selectedContacts().some((selected) => selected.id === contact.id);
  }

  toggleContact(contact: Contact): void {
    if (this.isSelected(contact)) {
      this.selectedContacts.update((list) => list.filter((selected) => selected.id !== contact.id));
    } else {
      this.selectedContacts.update((list) => [...list, contact]);
    }
  }

  onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.openList();
  }

  openList(): void {
    this.isOpen.set(true);
  }

  toggleList(): void {
    this.isOpen.update((open) => !open);
  }

  closeList(): void {
    this.isOpen.set(false);
    this.searchText.set('');
  }

  // Enfernt gelöschte Kontakte aus der Auswahl, sobald die Liste geladen ist.
  private removeDeletedFromSelection(): void {
    const users = this.contactService.users();
    if (this.contactService.loading() || users.length === 0) {
      return;
    }
    const ids = new Set(users.map((user) => user.id));
    const selected = this.selectedContacts();
    if (selected.some((contact) => !ids.has(contact.id))) {
      this.selectedContacts.set(selected.filter((contact) => ids.has(contact.id)));
    }
  }

  // Schließt die Liste, wenn außerhalb des Elements geklickt wird.
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeList();
    }
  }
}