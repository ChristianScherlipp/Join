import { Component, ElementRef, inject, ViewChild, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';
import { ContactService } from '../../../services/contact-service';
import { FieldError } from '../../../services/field-error';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';


@Component({
  imports: [ButtonPrimary, FormsModule, InitialIcon],
  providers: [FieldError],
  selector: 'app-edit-contact',
  styleUrl: './edit-contact.scss',
  templateUrl: './edit-contact.html',
})



export class EditContact {
  readonly contactService = inject(ContactService);
  readonly avatar = inject(ContactAvatar);
  readonly fieldError = inject(FieldError);

  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  //Die ID des Kontakts, der gerade bearbeitet wird.
  private contactId: number | null = null;

  //Hier werden die Formulareingaben gespeichert.
  formData = { name: '', email: '', phone: '' };


/**
 * Übernimmt den ausgewählten Kontakt und setzt das Formular
 * einschließlich seiner Eingabefelder zurück.
 */
open(contact: IUser | null): void {
  if (!contact) {
    return;
  }

  console.log('Kontakt zum Bearbeiten:', contact.id, contact.name);

  this.contactId = contact.id;

  this.formData = {
    name: contact.name,
    email: contact.email,
    phone: contact.phone ?? '',
  };

  this.editForm.resetForm(this.formData);

  this.contactService.errorMessage.set('');
  this.dialog.nativeElement.showModal();
}

  /**
   * Schließt den Dialog, sofern gerade nicht gespeichert wird.
   */
  close(): void {
    if (!this.contactService.saving()) {
      this.dialog.nativeElement.close();
    }
  }

  //Verhindert das Schließen mit Escape während des Speicherns.
  onCancel(event: Event): void {
    if (this.contactService.saving()) {
      event.preventDefault();
    }
  }

  /**
   * Speichert die gänderten Werte. Bei Erfolg wird der Dialog geschlossen.
   */
  async saveContact(): Promise<void> {
    if (this.contactId === null || !this.fieldError.validateAll(this.formData)) {
      return;
    }

    const isSaved = await this.contactService.updateContact(
      this.contactId,
      this.readFormValues()
    );

    if (isSaved) {
      this.close();
    }
  }

  /**
   * Löscht den Kontakt. Bei erfolg wird der Dialog geschlossen.
   */
  async deleteContact(): Promise<void> {
    if (this.contactId === null) {
      return;
    }

    const isDeleted = await this.contactService.deleteContact(this.contactId);

    if (isDeleted) {
      this.close()
    }
  }

  //Entfernt Leerzeichen am Rand. Eine leere Numnmer wird zu null.
  private readFormValues(): Omit<IUser, 'id'> {
    return {
      name: this.formData.name.trim(),
      email: this.formData.email.trim(),
      phone: this.formData.phone.trim() || null,
    };
  }

  previewName = signal('');

  updatePreview(value: string) {
    this.previewName.set(value);
  }
  @ViewChild('editForm')
  private editForm!: NgForm;
}
