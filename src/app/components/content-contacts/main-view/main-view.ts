import {
  Component,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';
import { Subtask, ISubtask } from '../../elements/subtask/subtask';

@Component({
  selector: 'app-main-view',
  imports: [InitialIcon, Subtask],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView {
  // Erhält den ausgewählten Kontakt von der Hauptkomponente.
  readonly contact = input<IUser | null>(null);

  // Meldet den Wunsch, den ausgewählten Kontakt zu bearbeiten.
  readonly editRequested = output<void>();

  // Meldet den Löschwunsch an die Hauptkomponente.
  readonly deleteRequested = output<void>();

  // Zugriff auf das mobile Menü im HTML.
  @ViewChild('actionMenu')
  private actionMenu?: ElementRef<HTMLDetailsElement>;

  /**
   * Schließt das Menü, wenn außerhalb davon geklickt wird.
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

  subtasks = signal<ISubtask[]>([]);
}