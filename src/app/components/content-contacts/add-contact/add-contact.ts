import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../../services/contact-service';
import { ContactAvatar } from '../../../services/contact-avatar';

@Component({
  selector: 'app-add-contact',
  imports: [FormsModule],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
})
export class AddContact {
  readonly contactService = inject(ContactService);
  readonly avatar: ContactAvatar = inject(ContactAvatar);

  // Zeigt der Hauptkomponente an, ob der Dialog geöffnet ist.
  readonly isOpen = signal(false);

  // Zugriff auf das dialog-Element im eigenen HTML.
  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  // Zugriff auf das Formular und seine Gültigkeit.
  @ViewChild('contactForm')
  private contactForm!: NgForm;

  avatarColor = '#FF7A00';

  // Hier werden die Formulareingaben gespeichert.
  newContact = {
    name: '',
    email: '',
    phone: '',
  };

  /**
   * Setzt das Formular zurück und öffnet den Dialog.
   * Die Vorschaufarbe wird einmal pro Öffnen ausgewählt.
   */
  open(): void {
    this.newContact = {
      name: '',
      email: '',
      phone: '',
    };

    this.avatarColor = this.avatar.getRandomColor();

    this.contactForm.resetForm(this.newContact);
    this.contactService.errorMessage.set('');

    this.dialog.nativeElement.showModal();
    this.isOpen.set(true);
  }

  /**
   * Schließt den Dialog, sofern gerade nicht gespeichert wird.
   */
  close(): void {
    if (!this.contactService.saving()) {
      this.dialog.nativeElement.close();
      this.isOpen.set(false);
    }
  }

  /**
   * Wird beim Drücken von Escape ausgeführt.
   * Während des Speicherns verhindern wir das Schließen.
   */
  onCancel(event: Event): void {
    if (this.contactService.saving()) {
      event.preventDefault();
    } else {
      this.isOpen.set(false);
    }
  }

  /**
   * Prüft die Eingaben und speichert den Kontakt über den Service.
   * Bei Erfolg wird der Dialog geschlossen.
   */
  async save(): Promise<void> {
    if (this.contactForm.invalid || this.contactService.saving()) {
      return;
    }

    // Entfernt Leerzeichen am Anfang und Ende.
    const name = this.newContact.name.trim();
    const email = this.newContact.email.trim();
    const phone = this.newContact.phone.trim();

    if (!name || !email) {
      this.contactService.errorMessage.set(
        'Bitte gib einen Namen und eine E-Mail-Adresse ein.'
      );

      return;
    }

    const saved = await this.contactService.addContact({
      name: name,
      email: email,
      phone: phone || null,
    });

    // Bei einem Fehler bleiben Dialog und Eingaben erhalten.
    if (saved) {
      this.close();
    }
  }
}