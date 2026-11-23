import {
  Component,
  computed,
  inject,
  input,
  output,
  afterRenderEffect,
  ElementRef,
} from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

/**
 * Describes a letter group in the contact list.
 */
interface ContactGroup {
  letter: string;
  contacts: IUser[];
}

/**
 * Contact list, grouped by initial letter.
 */
@Component({
  selector: 'app-namelist',
  imports: [InitialIcon],
  templateUrl: './namelist.html',
  styleUrl: './namelist.scss',
})
export class Namelist {
  readonly avatar: ContactAvatar = inject(ContactAvatar);

  private readonly element: ElementRef<HTMLElement> = inject(ElementRef);

  /** The already sorted contacts from the parent component. */
  readonly contacts = input.required<IUser[]>();

  /** true while the contacts are being loaded. */
  readonly loading = input(false);

  /** ID of the selected contact. */
  readonly selectedId = input<number | null>(null);

  /** Emits the clicked contact. */
  readonly contactSelected = output<IUser>();

  /** Emits when the create dialog should be opened. */
  readonly addRequested = output<void>();

  /** The letter groups, recalculated whenever the contact list changes. */
  readonly groups = computed(() => this.groupContacts());

  /**
   * Scrolls to the selected contact after rendering whenever the selection or list changes.
   */
  constructor() {
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
   * Groups the already sorted contacts by initial letter.
   *
   * @returns {ContactGroup[]} The groups in the order of the contacts.
   */
  private groupContacts(): ContactGroup[] {
    const groups: ContactGroup[] = [];

    for (const contact of this.contacts()) {
      const letter = contact.name.trim().charAt(0).toLocaleUpperCase('de') || '#';
      this.findOrCreateGroup(groups, letter).contacts.push(contact);
    }

    return groups;
  }

  /**
   * Finds the group of a letter and creates it if it is missing.
   *
   * @param {ContactGroup[]} groups - The previous groups.
   * @param {string} letter - The initial letter.
   * @returns {ContactGroup} The group of the letter.
   */
  private findOrCreateGroup(groups: ContactGroup[], letter: string): ContactGroup {
    let group = groups.find((entry) => entry.letter === letter);

    if (!group) {
      group = { letter, contacts: [] };
      groups.push(group);
    }

    return group;
  }

  /**
   * Scrolls only the scroll area of the contact list.
   * A contact that is already fully visible stays where it is.
   *
   * @param {number} id - The ID of the contact.
   * @returns {void}
   */
  private scrollToContact(id: number): void {
    const targets = this.findScrollTargets(id);

    if (!targets || this.isFullyVisible(targets.list, targets.button)) {
      return;
    }

    const top = this.centeredScrollTop(targets.list, targets.button);
    targets.list.scrollTo({ top, behavior: 'smooth' });
  }

  /**
   * Finds the scroll area and the button of a contact.
   * On mobile the list is hidden while the contact card is open, so there is no target.
   *
   * @param {number} id - The ID of the contact.
   * @returns {{ list: HTMLElement; button: HTMLElement } | null} Both elements or null.
   */
  private findScrollTargets(id: number): { list: HTMLElement; button: HTMLElement } | null {
    const host = this.element.nativeElement;

    if (host.getClientRects().length === 0) {
      return null;
    }

    const list = host.querySelector<HTMLElement>('.list-scroll');
    const button = host.querySelector<HTMLElement>(`[data-contact-id="${id}"]`);

    return list && button ? { list, button } : null;
  }

  /**
   * Checks whether a contact is fully visible in the scroll area.
   *
   * @param {HTMLElement} list - The scroll area.
   * @param {HTMLElement} button - The button of the contact.
   * @returns {boolean} true if the contact is completely visible.
   */
  private isFullyVisible(list: HTMLElement, button: HTMLElement): boolean {
    const listBounds = list.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();

    return buttonBounds.top >= listBounds.top && buttonBounds.bottom <= listBounds.bottom;
  }

  /**
   * Calculates the scroll position at which the contact is centered in the list.
   *
   * @param {HTMLElement} list - The scroll area.
   * @param {HTMLElement} button - The button of the contact.
   * @returns {number} The new scroll position in pixels.
   */
  private centeredScrollTop(list: HTMLElement, button: HTMLElement): number {
    const listBounds = list.getBoundingClientRect();
    const buttonBounds = button.getBoundingClientRect();

    return (
      list.scrollTop +
      buttonBounds.top -
      listBounds.top -
      list.clientHeight / 2 +
      buttonBounds.height / 2
    );
  }
}
