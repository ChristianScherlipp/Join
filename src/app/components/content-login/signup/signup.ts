import { Component, inject, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ContactService } from '../../../services/contact-service';
import { FieldError } from '../../../services/field-error';
import { IUser } from '../../../interfaces/iuser';
import { Supabase } from '../../../services/supabase';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonBack } from '../../elements/button-back/button-back';
import { ToastSuccess } from '../../elements/toast-succsess/toast-succsess';

/**
 * Sign up window. Validates the input, creates the user in the Supabase authentication
 * and adds the user to the contacts.
 * The back button leads to the login window.
 */
@Component({
  imports: [ButtonPrimary, ButtonBack, RouterLink, FormsModule, ToastSuccess],
  providers: [FieldError],
  selector: 'app-signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly supabase = inject(Supabase);
  private readonly router = inject(Router);
  private readonly contactService = inject(ContactService);

  readonly fieldError = inject(FieldError);

  /** True while the request to Supabase ist running. */
  readonly saving = signal(false);

  /**  Error message of SupaBase, e.g. when the email is already registered. */
  readonly errorMessage = signal('');

  @ViewChild('toast')
  private toast!: ToastSuccess;

  /** The form input.  */
  form = { name: '', email: '', password: '', confirmPassword: '', privacy: false };

  /**
   * Validates the form and creates the account.
   * On success the user is informed and led to the login.
   * On error the input is kept and the message is shown.
   * 
   * @return {Promise<void>}
   */
  async submit(): Promise<void> {
    this.errorMessage.set('');
    if (this.saving() || !this.validateForm()) {
      return;
    }
    this.saving.set(true);
    const created = await this.createAccount();
    this.saving.set(false);
    if (created) {
      await this.finishSignup();
    }
  }

  /**
   * Creates the user in the authentication and adds the user to the contacts.
   * 
   * @returns {Promise<boolean>} true = both saved, false = failed.
   */
  private async createAccount(): Promise<boolean> {
    const { error } = await this.supabase.signUp(this.cleanEmail(), this.form.password, this.form.name.trim());
    if (error) {
      this.errorMessage.set(error.message);
      return false;
    }
    const saved = await this.contactService.addContact(this.contactData());
    if (!saved) {
      this.errorMessage.set(this.contactService.errorMessage());
    }
    return saved;
  }

  /**
   * Ends the session created by the sign up, shows the toast and leads to the login.
   * 
   * @returns {Promise<void>}
   */
  private async finishSignup(): Promise<void> {
    await this.supabase.signOut();
    this.toast.show('You signed up succesfully');
    window.setTimeout(() => void this.router.navigateByUrl('/login'), 1500);
  }

  /**
   * Builds the contact of the new user. A phone number does not exist yet.
   * 
   * @returns {Omit<IUser, 'id'>} The contact data.
   */
  private contactData(): Omit<IUser, 'id'> {
    return {name: this.form.name.trim(), email: this.cleanEmail(), phone: null};
  }

  /**
   * Checks all fields so that every error becomes visible at once.
   * 
   * @returns {boolean} true if all fields are valid.
   */
  validateForm(): boolean {
    const results = [
      this.fieldError.check('name', this.form.name),
      this.fieldError.check('email', this.form.email),
      this.fieldError.check('password', this.form.password),
      this.fieldError.checkConfirm(this.form.password, this.form.confirmPassword),
      this.fieldError.check('privacy', this.privacyValue()),
    ];
    return results.every(Boolean);
  }

  /**
   * Takes over the checkbox state and validates it directly.
   * 
   * @param {boolean} accepted - The new state of the checkbox.
   * @returns {void}
   */
  setPrivacy(accepted: boolean): void {
    this.form.privacy = accepted;
    this.fieldError.check('privacy', this.privacyValue());
  }

  /**
   * Trims surrounding whitespace and stores the email in lowercase.
   * 
   * @returns {string} The cleaned email.
   */
  private cleanEmail(): string {
    return this.form.email.trim().toLowerCase();
  }

  /**
   * Converts the checkbox state to the privacy rule expects.
   * 
   * @returns {string} 'yes' if accepted, otherwise an empty string.
   */
  private privacyValue(): string {
    return this.form.privacy ? 'yes' : '';
  }
}
