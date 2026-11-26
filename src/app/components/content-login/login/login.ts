import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FieldError } from '../../../services/field-error';
import { Supabase } from '../../../services/supabase';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { F } from '@angular/cdk/keycodes';
import { email } from '@angular/forms/signals';

/**
 * Login window with the email and password inputs and the buttons to log in as user or guest.
 * Validates the input and checks the user against the Supabase authentication.
 */
@Component({
  imports: [ButtonPrimary, FormsModule],
  providers: [FieldError],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private readonly supabase = inject(Supabase);
  private readonly router = inject(Router);

  readonly fieldError = inject(FieldError);

  /**True while thhe request to Supabase is running. */
  readonly saving = signal(false);

  /** Error message below the form, e.g. when email or password are wrong. */
  readonly errorMessage = signal('');

  /** The form input. */
  form = { email: '', password: '' };

  /**
   * Validates the input and logs the user in.
   * On success the user is led to the summary, otherwise the error message is shown.
   * 
   * @returns {Promise<void>}
   */
  async submit(): Promise<void> {
    this.errorMessage.set('');
    if (this.saving() || !this.validateForm()) {
      return;
    }
    this.saving.set(true);
    const { error } = await this.supabase.signIn(this.form.email.trim().toLowerCase(), this.form.password);
    this.saving.set(false);
    if (error) {
      this.errorMessage.set(this.messageFor(error.code));
      return;
    }
    void this.router.navigateByUrl('/summary')
  }

  /**
   * Checks both fields so that every error becomes visible at once.
   * 
   * @returns {boolean} true if both fields are valid.
   */
  validateForm(): boolean {
    const results = [
      this.fieldError.check('email', this.form.email),
      this.fieldError.check('loginPassword', this.form.password),
    ];
    return results.every(Boolean);
  }

  /**
   * Chooses the message for a failed login. It never tells which of both was wrong.
   * 
   * @param {string | undefined} code - The error code of Supabase.
   * @returns {string} The message for the user.
   */
  private messageFor(code: string | undefined): string {
    return code === 'invalid_credentials'
      ? 'Email or password is wrong'
      : 'Login failed. Please try again later.'
  }

  /**
   * Creates a guest session and opens the summary page.
   * The email and password fields are not validated.
   */
  async guestLogin(): Promise<void> {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    try {
      const { error } = await this.supabase.signInAsGuest();

      if (error) {
        this.errorMessage.set(
          'Gast-Login fehlgeschlagen. Bitte versuche es erneut.'
        );

        console.error('Gast-Login fehlgeschlagen:', error);
        return;
      }

      await this.router.navigateByUrl('/summary');
    } catch (error) {
      console.error('Gast-Login fehlgeschlagen:', error);

      this.errorMessage.set(
        'Gast-Login fehlgeschlagen. Bitte prüfe deine Verbindung.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}
