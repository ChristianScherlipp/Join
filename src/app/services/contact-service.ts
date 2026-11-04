import { Injectable, computed, inject, signal } from '@angular/core';
import { IUser } from '../interfaces/iuser';
import { Supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly supabase = inject(Supabase).supabase;

  // Die geladenen Kontakte.
  readonly users = signal<IUser[]>([]);

  // Zeigt an, ob gerade geladen oder gespeichert wird.
  readonly loading = signal(false);
  readonly saving = signal(false);

  // Diese Meldung wird bei einem Fehler im HTML angezeigt.
  readonly errorMessage = signal('');

  // Sortiert eine Kopie der Kontakte alphabetisch.
  // Die ursprüngliche Liste wird dabei nicht verändert.
  readonly sortedUsers = computed(() =>
    [...this.users()].sort((firstContact, secondContact) =>
      firstContact.name.localeCompare(secondContact.name, 'de')
    )
  );

  channel: RealtimeChannel | undefined;

  subscribeToContacts(): void {
    if (this.channel) return; 

    this.channel = this.supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'contacts' },
        () => this.getUsers() 
      )
      .subscribe();
  }

  unsubscribeFromContacts(): void {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = undefined;
    }
  }

  /**
   * Lädt die Kontakte aus Supabase.
   * Bei einem Fehler wird eine Meldung gesetzt.
   */
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

      // Falls keine Daten zurückkommen, verwenden wir eine leere Liste.
      this.users.set(data ?? []);
    } catch (error) {
      console.error('Kontakte laden fehlgeschlagen:', error);

      this.errorMessage.set(
        'Die Kontakte konnten nicht geladen werden.'
      );
    } finally {
      // Wird bei Erfolg und bei einem Fehler ausgeführt.
      this.loading.set(false);
    }
  }

  /**
   * Speichert einen neuen Kontakt.
   * Omit bedeutet: Die ID wird nicht mitgegeben.
   * Die Datenbank erzeugt sie automatisch.
   *
   * true = gespeichert, false = fehlgeschlagen.
   */
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

      // Ergänzt die Liste um den gespeicherten Kontakt inklusive ID.
      this.users.update((contacts) => [...contacts, data]);

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



  // Delete
  async deleteContact(id: number) {
    const { error } = await this.supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) console.error(error);
  }

  //Update
   async updateUser(id: number, name: string, mail: string, phone: number) {
    const { error } = await this.supabase
      .from('contacts')
      .update({ name, mail, phone })
      .eq('id', id);

    if (error) console.error(error);
  }
}