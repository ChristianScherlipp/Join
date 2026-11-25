import { Component } from '@angular/core';
import { ButtonPrimary } from '../../elements/button-primary/button-primary';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Login window with the email and password inputs and the buttons to log in as user or guest.
 */
@Component({
  imports: [ButtonPrimary],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  async signInWithEmail(supabase: SupabaseClient) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'valid.email@supabase.io',
      password: 'example-password',
    });
  }
}
