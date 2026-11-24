import { Component, ElementRef, inject, output, signal, ViewChild, } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../../services/contact-service';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { FieldError } from '../../../services/field-error';
import { IUser } from '../../../interfaces/iuser';
import { InitialIcon } from '../../elements/initial-icon/initial-icon';

/**
 * Dialog for creating a new contact.
 */
@Component({
  imports: [ButtonPrimary, FormsModule, InitialIcon],
  providers: [FieldError],
  selector: 'app-add-contact',
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
})
export class AddContact {
  readonly contactService = inject(ContactService);

  readonly fieldError = inject(FieldError);

  /** Shows the parent component whether the dialog is open. */
  readonly isOpen = signal(false);

  /** Emits when a contact was created. */
  readonly created = output<void>();

  /** The name for the avatar preview in the dialog. */
  previewName = signal('');

  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  @ViewChild('contactForm')
  private contactForm!: NgForm;

  /** The form input. */
  newContact = {
    name: '',
    email: '',
    phone: '',
  };

  /**
   * Resets the form and opens the dialog.
   *
   * @returns {void}
   */
  open(): void {
    this.newContact = { name: '', email: '', phone: '' };
    this.contactForm.resetForm(this.newContact);
    this.contactService.errorMessage.set('');
    this.previewName.set('');
    this.dialog.nativeElement.showModal();
    this.isOpen.set(true);
  }

  /**
   * Closes the dialog unless it is currently saving.
   *
   * @returns {void}
   */
  close(): void {
    if (!this.contactService.saving()) {
      this.dialog.nativeElement.close();
      this.isOpen.set(false);
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
    } else {
      this.isOpen.set(false);
    }
  }

  /**
   * Validates the input and saves the contact via the service.
   * On success the dialog is closed.
   * On error the dialog and input are kept.
   *
   * @returns {Promise<void>}
   */
  async save(): Promise<void> {
    if (this.contactService.saving() || !this.fieldError.validateAll(this.newContact)) {
      return;
    }

    const saved = await this.contactService.addContact(this.readFormValues());

    if (saved) {
      this.close();
      this.created.emit();
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
      name: this.newContact.name.trim(),
      email: this.newContact.email.trim().toLowerCase(),
      phone: this.newContact.phone.trim() || null,
    };
  }
}
