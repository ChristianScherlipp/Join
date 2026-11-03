import { Service, signal } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { IUser } from '../interfaces/iuser';

@Service()
export class Supabase {

  supabaseUrl = 'https://sunoqfhbaaynuihtjtkc.supabase.co';
  supabaseKey = 'sb_publishable_0VhGDb9ZyrbyzO6jthywRw_O1TfyOjY';
  supabase = createClient(this.supabaseUrl, this.supabaseKey);

  users = signal<IUser[]>([]);

  channels: RealtimeChannel | undefined

  subscribeToUsers() {
    if (this.channels) return;

    this.channels = this.supabase
      .channel('contact-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contact-list' },
        () => this.getUsers()
      )
      .subscribe();
  }

  // CRUD-Operationen Create Read Update Delete
  //Create
  async addUser(name: string, mail: string, phone: number) {
    const { data, error } = await this.supabase
      .from('contact-list')
      .insert([
        { name: name, mail: mail, phone: phone },
      ])

    if (error) {
      console.error(error);
      return;
    }
  }

  //Read
  async getUsers() {
    const { data, error } = await this.supabase
      .from('contact-list')
      .select('id, name, mail, phone')
      .order('id');

    if (error) {
      console.error(error);
      return;
    }

    this.users.set(data ?? []);
  }

  //Update
  async updateUser(id: number, column: string, value: any) {

    const { data, error } = await this.supabase
      .from('contact-list')
      .update({ [column]: value })
      .eq('id', id)
      .select()

    if (error) {
      console.error(error);
      return;
    }
  }

  //Delete 
  async deleteUser(id:number) {
    const { error } = await this.supabase
      .from('contact-list')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error);
      return;
    }
  }

}
