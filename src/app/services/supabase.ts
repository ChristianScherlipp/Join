import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class Supabase {
  private supabaseUrl = 'https://sunoqfhbaaynuihtjtkc.supabase.co';
  private supabaseKey = 'sb_publishable_0VhGDb9ZyrbyzO6jthywRw_O1TfyOjY';

  readonly supabase = createClient(
    this.supabaseUrl,
    this.supabaseKey
  );
}
