import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroments';

/**
 * Provides the shared Supabase client.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabaseUrl = environment.supabaseUrl;
  private supabaseKey = environment.supabaseKey;

  /** The client for all database access. */
  readonly supabase = createClient(
    this.supabaseUrl,
    this.supabaseKey
  );

  private ClientSupabase: SupabaseClient;

  constructor() {
    this.ClientSupabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async signUp(email: string, password: string, name: string) {
    return this.ClientSupabase.auth.signUp({ email, password, options: {data: {name} } });
  }

  async signIn(email: string, password: string) {
    return this.ClientSupabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return this.ClientSupabase.auth.signOut();
  }

  getUser() {
    return this.ClientSupabase.auth.getUser();
  }

}
