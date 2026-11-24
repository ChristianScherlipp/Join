import { Component, ElementRef, HostListener, OnDestroy, OnInit, computed, effect, inject, model, signal } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactService } from '../../../services/contact-service';
import { InitialIcon } from '../initial-icon/initial-icon';

/** The dropdown only needs the ID and name of a contact. */
type Contact = Pick<IUser, 'id' | 'name'>;

/** This many initial icons are shown below the field, the rest as a number. */
const MAX_VISIBLE = 3;

/**
 * Dropdown with search in which contacts are assigned to a task.
 *
 * @example
 * <app-drop-down-assignedto [(selectedContacts)]="assignedContacts" />
 */
@Component({
  imports: [InitialIcon],
  selector: 'app-drop-down-assignedto',
  styleUrl: './drop-down-assignedto.scss',
  templateUrl: './drop-down-assignedto.html',
})
export class DropDownAssignedto implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly contactService = inject(ContactService);

  /** All selectable contacts in the same order as the contact list. */
  readonly contacts = this.contactService.sortedUsers;

  /** Selected contacts, bindable from the parent via [(selectedContacts)]. */
  readonly selectedContacts = model<Contact[]>([]);

  readonly isOpen = signal(false);
  readonly searchText = signal('');

  /** Contacts whose name contains the search text. */
  readonly filteredContacts = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    return this.contacts().filter((contact) => contact.name.toLowerCase().includes(term));
  });

  readonly visibleContacts = computed(() =>
    this.selectedContacts().slice(0, MAX_VISIBLE));

  readonly hasMoreContacts = computed(() =>
    this.selectedContacts().length > MAX_VISIBLE);

  readonly hiddenContacts = computed(() =>
    this.selectedContacts().length - MAX_VISIBLE);

  /**
   * Automatically removes deleted contacts from the selection.
   */
  constructor() {
    effect(() => this.removeDeletedFromSelection());
  }

  /**
   * Loads the contacts fresh and keeps them up to date via a live connection.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    void this.contactService.getUsers();
    this.contactService.subscribeToContacts();
  }

  /**
   * Ends the live connection.
   *
   * @returns {void}
   */
  ngOnDestroy(): void {
    this.contactService.unsubscribeFromContacts();
  }

  /**
   * Checks whether a contact is selected.
   *
   * @param {Contact} contact - The contact.
   * @returns {boolean} true if the contact is selected.
   */
  isSelected(contact: Contact): boolean {
    return this.selectedContacts().some((selected) => selected.id === contact.id);
  }

  /**
   * Selects a contact or removes it from the selection again.
   *
   * @param {Contact} contact - The contact.
   * @returns {void}
   */
  toggleContact(contact: Contact): void {
    if (this.isSelected(contact)) {
      this.selectedContacts.update((list) => list.filter((selected) => selected.id !== contact.id));
    } else {
      this.selectedContacts.update((list) => [...list, contact]);
    }
  }

  /**
   * Takes over the search text and opens the list.
   *
   * @param {Event} event - The input event of the search field.
   * @returns {void}
   */
  onSearch(event: Event): void {
    this.searchText.set((event.target as HTMLInputElement).value);
    this.openList();
  }

  /**
   * Opens the list.
   *
   * @returns {void}
   */
  openList(): void {
    this.isOpen.set(true);
  }

  /**
   * Opens the list or closes it again.
   *
   * @returns {void}
   */
  toggleList(): void {
    this.isOpen.update((open) => !open);
  }

  /**
   * Closes the list and clears the search text.
   *
   * @returns {void}
   */
  closeList(): void {
    this.isOpen.set(false);
    this.searchText.set('');
  }

  /**
   * Closes the list when clicking outside the element.
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeList();
    }
  }

  /**
   * Removes deleted contacts from the selection as soon as the list is loaded.
   *
   * @returns {void}
   */
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
}
