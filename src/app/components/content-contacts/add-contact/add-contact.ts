import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../../services/contact-service';

@Component({
  selector: 'app-add-contact',
  imports: [FormsModule],
  templateUrl: './add-contact.html',
  styleUrl: './add-contact.scss',
})
export class AddContact {
  readonly contactService = inject(ContactService);
  readonly isOpen = signal(false);

  @ViewChild('dialog')
  private dialog!: ElementRef<HTMLDialogElement>;

  @ViewChild('contactForm')
  private contactForm!: NgForm;

  private readonly colors = [
    '#FF7A00', '#9327FF', '#6E52FF',
    '#FC71FF', '#00BEE8', '#1FD7C1', '#FF4646',
  ];

  avatarColor = '#FF7A00';

  newContact = {
    name: '',
    email: '',
    phone: '',
  };

  open(): void {
    this.newContact = {
      name: '',
      email: '',
      phone: '',
    };

    this.avatarColor =
      this.colors[Math.floor(Math.random() * this.colors.length)];

    this.contactForm.resetForm(this.newContact);
    this.contactService.errorMessage.set('');

    this.dialog.nativeElement.showModal();
    this.isOpen.set(true);
  }

  close(): void {
    if (!this.contactService.saving()) {
      this.dialog.nativeElement.close();
      this.isOpen.set(false);
    }
  }

  onCancel(event: Event): void {
    if (this.contactService.saving()) {
      event.preventDefault();
    } else {
      this.isOpen.set(false);
    }
  }

  getInitials(name: string): string {
    return name.trim().split(/\s+/).slice(0, 2)
      .map((part) => part.charAt(0)).join('').toUpperCase();
  }

  async save(): Promise<void> {
    if (this.contactForm.invalid || this.contactService.saving()) {
      return;
    }

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
      name,
      email,
      phone: phone || null,
    });

    if (saved) {
      this.close();
    }
  }
}