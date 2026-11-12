import { Component, ElementRef, HostListener, computed, inject, input, model, signal } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { InitialIcon } from '../initial-icon/initial-icon';

// Das Dropdown braucht von einem Kontakt nur id und nam.
type Contact = Pick<IUser, 'id' | 'name'>;

// Testdaten, nur bis die echten Kontakte per input() übergeben werden.
const TEST_CONTACTS: Contact[] = [
  { id: 1, name: 'Sofia Müller' },
  { id: 2, name: 'Anton Mayer' },
  { id: 3, name: 'Anja Schulz' },
  { id: 4, name: 'Benedikt Ziegler' },
  { id: 5, name: 'David Eisenberg' },
  { id: 6, name: 'Eva Fischer' },
];

@Component({
  imports: [InitialIcon],
  selector: 'app-drop-down-assignedto',
  styleUrl: './drop-down-assignedto.scss',
  templateUrl: './drop-down-assignedto.html',
})
export class DropDownAssignedto {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  // Alle wählbaren Kontakte, Standard sind die Testdaten.
  readonly contacts = input<Contact[]>(TEST_CONTACTS);

  // Ausgewählte Kontakte, per [(selectedContacts)] vom Parent bindbar.
  readonly selectedContacts = model<Contact[]>([]);

  readonly isOpen = signal(false);
  readonly searchText = signal('');

  // Kontakte, deren Name den Suchtext enthält.
  readonly filteredContacts = computed(() => {
    const term = this.searchText().trim().toLowerCase();
    return this.contacts().filter((contact) => contact.name.toLowerCase().includes(term));
  });

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

  // Schließt die Liste, wenn außerhalb des Elements geklickt wird.
  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeList();
    }
  }
}