import { Injectable, computed, inject, signal } from '@angular/core';
import { IUser } from '../interfaces/iuser';
import { Supabase } from './supabase';
import { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';
import { defaultEquals } from '@angular/core/primitives/signals';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly supabase = inject(Supabase).supabase;

  // Die geladenen Kontakte.
  readonly users = signal<IUser[]>([]);

  // Der ausgewählte Kontakt bleibt erhalten, auch wenn die Seite gewechselt wird.
  readonly selectedContact = signal<IUser | null>(null);

  // Zeigt an, ob gerade geladen oder gespeichert wird.
  readonly loading = signal(false);
  readonly saving = signal(false);

  // Diese Meldung wird bei einem Fehler im HTML angezeigt.
  readonly errorMessage = signal('');

  // readonly contactService = inject(ContactService);



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

  /**
   * Löscht den Kontakt mit der übergabenen ID.
   * true = gelöscht, false = fehlgeschlagen.
   * Die Liste wird danach über die Realtime-verbindung neu geladen 
   */
  // async deleteContact(id: number): Promise<boolean> {
  //   this.saving.set(true);
  //   this.errorMessage.set('');

  //   const { error } = await this.supabase.from('contacts').delete().eq('id', id);

  //   const failed = this.hasFailed(error, 'Der Kontakt konnte nicht gelöscht werden.');

  //   if (!failed && this.selectedContact()?.id === id) {
  //     this.selectedContact.set(null);
  //   }

  //   return !failed;
  // }

  async deleteContact(id: number): Promise<boolean> {
    this.saving.set(true);
    this.errorMessage.set('');

    const { error } = await this.supabase.from('contacts').delete().eq('id', id);

    this.saving.set(false);

    const failed = this.hasFailed(error, 'Der Kontakt konnte nicht gelöscht werden.');

    if (!failed && this.selectedContact()?.id === id) {
      this.selectedContact.set(null);
    }

    return !failed;
  }

  /**
  * Ändert den Kontakt mit der übergebenen ID.
  * true = gespeichert, false = fehlgeschlagen.
  */
  async updateContact(id: number, changes: Omit<IUser, 'id'>): Promise<boolean> {
    this.saving.set(true);
    this.errorMessage.set('');
    const { error } = await this.supabase.from('contacts').update(changes).eq('id', id);
    this.saving.set(false);
    const failed = this.hasFailed(error, 'Der Kontakt konnte nicht geändert werden.');
    if (!failed && this.selectedContact()?.id === id) {
      this.selectedContact.set({ id, ...changes });
    }
    return !failed;
  }

  //Gibt true zurück, wenn ein fehler vorliegt, und setzt dann die Meldung für die oberfläche.
  private hasFailed(error: PostgrestError | null, message: string): boolean {
    if (!error) {
      return false;
    }

    console.error(message, error);
    this.errorMessage.set(message);
    return true;
  }
}