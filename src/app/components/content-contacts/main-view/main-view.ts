import {
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

/**
 * Contact card with the details of the selected contact.
 */
@Component({
  selector: 'app-main-view',
  imports: [InitialIcon],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView {
  /** The selected contact from the parent component. */
  readonly contact = input<IUser | null>(null);

  /** Emits the request to edit the selected contact. */
  readonly editRequested = output<void>();

  /** Emits the delete request to the parent component. */
  readonly deleteRequested = output<void>();

  @ViewChild('actionMenu')
  private actionMenu?: ElementRef<HTMLDetailsElement>;

  /**
   * Closes the mobile menu when clicking outside of it.
   *
   * @param {MouseEvent} event - The click event.
   * @returns {void}
   */
  @HostListener('document:click', ['$event'])
  closeMenuOnOutsideClick(event: MouseEvent): void {
    const menu = this.actionMenu?.nativeElement;
    const target = event.target;

    if (!menu || !menu.open || !(target instanceof Node)) {
      return;
    }

    if (!menu.contains(target)) {
      menu.open = false;
    }
  }
}
