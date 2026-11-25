import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroments';

/**
 *  Provides the shared Supabase client and the authentication.
 * One client for everything, so the login session is known to the database access, too.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {

  /** The client for all database access and the authentication. */
  readonly supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  async signUp(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({ email, password, options: {data: {name} } });
  }

  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.supabase.auth.signOut();
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

}
