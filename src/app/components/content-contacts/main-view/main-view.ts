import { Component, input, output } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

@Component({
  selector: 'app-main-view',
  imports: [InitialIcon],
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
}