import { Component, ElementRef, inject, output, ViewChild, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { IUser } from '../../../interfaces/iuser';
import { ContactAvatar } from '../../../services/contact-avatar';
import { ContactService } from '../../../services/contact-service';
import { FieldError } from '../../../services/field-error';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

/**
 * Dialog for editing and deleting a contact.
 */
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

  /** Emits when a contact was saved. */
  readonly created = output<void>();

  /** The name for the avatar preview in the dialog. */
  previewName = signal('');

  /** The form input. */
  formData = { name: '', email: '', phone: '' };

  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  @ViewChild('editForm')
  private editForm!: NgForm;

  private contactId: number | null = null;

  /**
   * Takes over the selected contact and resets the form including its fields.
   *
   * @param {IUser | null} contact - The contact to edit.
   * @returns {void}
   */
  open(contact: IUser | null): void {
    if (!contact) {
      return;
    }

    this.contactId = contact.id;
    this.formData = { name: contact.name, email: contact.email, phone: contact.phone ?? '' };
    this.editForm.resetForm(this.formData);
    this.previewName.set(contact.name);
    this.contactService.errorMessage.set('');
    this.dialog.nativeElement.showModal();
  }

  /**
   * Closes the dialog unless it is currently saving.
   *
   * @returns {void}
   */
  close(): void {
    if (!this.contactService.saving()) {
      this.dialog.nativeElement.close();
    }
  }

  /**
   * Prevents closing with Escape while saving.
   *
   * @param {Event} event - The cancel event of the dialog.
   * @returns {void}
   */
  onCancel(event: Event): void {
    if (this.contactService.saving()) {
      event.preventDefault();
    }
  }

  /**
   * Saves the changed values. On success the dialog is closed.
   *
   * @returns {Promise<void>}
   */
  async saveContact(): Promise<void> {
    if (this.contactId === null || !this.fieldError.validateAll(this.formData)) {
      return;
    }

    const isSaved = await this.contactService.updateContact(this.contactId, this.readFormValues());

    if (isSaved) {
      this.close();
      this.created.emit();
    }
  }

  /**
   * Deletes the contact. On success the dialog is closed.
   *
   * @returns {Promise<void>}
   */
  async deleteContact(): Promise<void> {
    if (this.contactId === null) {
      return;
    }

    const isDeleted = await this.contactService.deleteContact(this.contactId);

    if (isDeleted) {
      this.close();
    }
  }

  /**
   * Takes over the name for the avatar preview.
   *
   * @param {string} value - The entered name.
   * @returns {void}
   */
  updatePreview(value: string): void {
    this.previewName.set(value);
  }

  /**
   * Trims surrounding whitespace and stores the email in lowercase.
   * An empty number becomes null.
   *
   * @returns {Omit<IUser, 'id'>} The cleaned contact data.
   */
  private readFormValues(): Omit<IUser, 'id'> {
    return {
      name: this.formData.name.trim(),
      email: this.formData.email.trim().toLowerCase(),
      phone: this.formData.phone.trim() || null,
    };
  }
}
