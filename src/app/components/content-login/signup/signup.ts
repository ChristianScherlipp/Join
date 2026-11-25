import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FieldError } from '../../../services/field-error';
import { Supabase } from '../../../services/supabase';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { ButtonBack } from '../../elements/button-back/button-back';

/**
 * Sign up window. Validates the input and creates the user in the Supabase authentication.
 *The back button leads to the login.
 */
@Component({
  imports: [ButtonPrimary, ButtonBack, RouterLink, FormsModule],
  providers: [FieldError],
  selector: 'app-signup',
  styleUrl: './signup.scss',
  templateUrl: './signup.html',
})
export class Signup {
  private readonly supabase = inject(Supabase);
  private readonly router = inject(Router);

  readonly fieldError = inject(FieldError);

  /** True while the request to Supabase ist running. */
  readonly saving = signal(false);

  /**  Error message of SupaBase, e.g. when the email is already registered. */
  readonly errorMessage = signal('');

  /** The form input.  */
  form = { name: '', email: '', password: '', confirmPassword: '', privacy: false };

  /**
   * Validates the form, created the nuser and leads to the login on success.
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
    const { error } = await this.supabase.signUp(this.cleanEmail(), this.form.password, this.form.name.trim());
    this.saving.set(false);
    if (error) {
      this.errorMessage.set(error.message);
      return;
    }
    void this.router.navigateByUrl('/login');
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
