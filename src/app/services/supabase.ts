import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

/**
 * Provides the shared Supabase client.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabaseUrl = 'https://sunoqfhbaaynuihtjtkc.supabase.co';
  private supabaseKey = 'sb_publishable_0VhGDb9ZyrbyzO6jthywRw_O1TfyOjY';

  /** The client for all database access. */
  readonly supabase = createClient(
    this.supabaseUrl,
    this.supabaseKey
  );
}
