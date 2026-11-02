import { Service } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Service()
export class Supabase {

  supabaseUrl = 'https://sunoqfhbaaynuihtjtkc.supabase.co';
  supabaseKey = 'sb_publishable_0VhGDb9ZyrbyzO6jthywRw_O1TfyOjY';
  supabase = createClient(this.supabaseUrl, this.supabaseKey);

}
