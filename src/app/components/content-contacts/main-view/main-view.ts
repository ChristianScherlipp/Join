import { Component, inject, input } from '@angular/core';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';

@Component({
  selector: 'app-main-view',
  imports: [],
  templateUrl: './main-view.html',
  styleUrl: './main-view.scss',
})
export class MainView {
  readonly avatar: ContactAvatar = inject(ContactAvatar);

  // Die Hauptkomponente übergibt den ausgewählten Kontakt.
  // Ohne Auswahl ist der Wert null.
  readonly contact = input<IUser | null>(null);
}