import { Injectable, computed, inject, signal } from '@angular/core';
import { IUser } from '../interfaces/iuser';
import { Supabase } from './supabase';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly supabase = inject(Supabase).supabase;

  readonly users = signal<IUser[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal('');

  readonly sortedUsers = computed(() =>
    [...this.users()].sort((a, b) =>
      a.name.localeCompare(b.name, 'de')
    )
  );

  async getUsers(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .select('id, name, email, phone');

      if (error) {
        throw error;
      }

      this.users.set(data ?? []);
    } catch (error) {
      console.error('Kontakte laden fehlgeschlagen:', error);
      this.errorMessage.set(
        'Die Kontakte konnten nicht geladen werden.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  async addContact(contact: Omit<IUser, 'id'>): Promise<boolean> {
    this.saving.set(true);
    this.errorMessage.set('');

    try {
      const { data, error } = await this.supabase
        .from('contacts')
        .insert(contact)
        .select('id, name, email, phone')
        .single();

      if (error) {
        throw error;
      }

      this.users.update((users) => [...users, data]);

      return true;
    } catch (error) {
      console.error('Kontakt speichern fehlgeschlagen:', error);
      this.errorMessage.set(
        'Der Kontakt konnte nicht gespeichert werden.'
      );

      return false;
    } finally {
      this.saving.set(false);
    }
  }
}