import { Injectable, computed, inject, signal } from '@angular/core';
import { IUser } from '../interfaces/iuser';
import { Supabase } from './supabase';
import { PostgrestError, RealtimeChannel } from '@supabase/supabase-js';

/**
 * Manages all contacts: loading, creating, updating, deleting and live updates.
 */
@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly supabase = inject(Supabase).supabase;

  /** The loaded contacts. */
  readonly users = signal<IUser[]>([]);

  /** The selected contact, kept even after switching pages. */
  readonly selectedContact = signal<IUser | null>(null);

  /** Shows whether data is currently being loaded. */
  readonly loading = signal(false);

  /** Shows whether data is currently being saved. */
  readonly saving = signal(false);

  /** Error message for the UI. */
  readonly errorMessage = signal('');

  /** Copy of the contacts, sorted alphabetically by name. */
  readonly sortedUsers = computed(() =>
    [...this.users()].sort((firstContact, secondContact) =>
      firstContact.name.localeCompare(secondContact.name, 'de')
    )
  );

  /** The realtime connection to the "contacts" table. */
  channel: RealtimeChannel | undefined;

  private subscribers = 0;

  /**
   * Starts the live connection and counts its users.
   * An already open connection is reused.
   *
   * @returns {void}
   */
  subscribeToContacts(): void {
    this.subscribers++;
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

  /**
   * Closes the live connection only when nobody uses it anymore.
   *
   * @returns {void}
   */
  unsubscribeFromContacts(): void {
    this.subscribers = Math.max(0, this.subscribers - 1);
    if (this.subscribers > 0) return;

    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = undefined;
    }
  }

  /**
   * Loads the contacts from Supabase.
   * On error a message is set.
   *
   * @returns {Promise<void>}
   */
  async getUsers(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');

    try {
      this.users.set(await this.fetchContacts());
    } catch {
      this.errorMessage.set('Die Kontakte konnten nicht geladen werden.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Saves a new contact. The database generates the ID.
   *
   * @param {Omit<IUser, 'id'>} contact - The contact without an ID.
   * @returns {Promise<boolean>} true = saved, false = failed.
   */
  async addContact(contact: Omit<IUser, 'id'>): Promise<boolean> {
    this.beginSaving();

    try {
      this.rememberContact(await this.insertContact(contact));
      return true;
    } catch {
      this.errorMessage.set('Der Kontakt konnte nicht gespeichert werden.');
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  /**
   * Deletes the contact with the given ID.
   * The list is then reloaded through the realtime connection.
   *
   * @param {number} id - The ID of the contact.
   * @returns {Promise<boolean>} true = deleted, false = failed.
   */
  async deleteContact(id: number): Promise<boolean> {
    this.beginSaving();
    const { error } = await this.supabase.from('contacts').delete().eq('id', id);
    this.saving.set(false);
    const failed = this.hasFailed(error, 'Der Kontakt konnte nicht gelöscht werden.');
    if (!failed && this.selectedContact()?.id === id) {
      this.selectedContact.set(null);
    }
    return !failed;
  }

  /**
   * Updates the contact with the given ID.
   *
   * @param {number} id - The ID of the contact.
   * @param {Omit<IUser, 'id'>} changes - The new values.
   * @returns {Promise<boolean>} true = saved, false = failed.
   */
  async updateContact(id: number, changes: Omit<IUser, 'id'>): Promise<boolean> {
    this.beginSaving();
    const { error } = await this.supabase.from('contacts').update(changes).eq('id', id);
    this.saving.set(false);
    const failed = this.hasFailed(error, 'Der Kontakt konnte nicht geändert werden.');
    if (!failed && this.selectedContact()?.id === id) {
      this.selectedContact.set({ id, ...changes });
    }
    return !failed;
  }

  /**
   * Starts a write operation and clears the old error message.
   *
   * @returns {void}
   */
  private beginSaving(): void {
    this.saving.set(true);
    this.errorMessage.set('');
  }

  /**
   * Adds the saved contact to the list and selects it.
   *
   * @param {IUser} saved - The saved contact including its ID.
   * @returns {void}
   */
  private rememberContact(saved: IUser): void {
    this.users.update((contacts) => [...contacts, saved]);
    this.selectedContact.set(saved);
  }

  /**
   * Queries all contacts in Supabase.
   *
   * @returns {Promise<IUser[]>} The contacts, an empty list if there is no data.
   * @throws The Supabase error if the query fails.
   */
  private async fetchContacts(): Promise<IUser[]> {
    const { data, error } = await this.supabase
      .from('contacts')
      .select('id, name, email, phone');
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Inserts a contact into Supabase.
   *
   * @param {Omit<IUser, 'id'>} contact - The contact without an ID.
   * @returns {Promise<IUser>} The saved contact including its ID.
   * @throws The Supabase error if saving fails.
   */
  private async insertContact(contact: Omit<IUser, 'id'>): Promise<IUser> {
    const { data, error } = await this.supabase
      .from('contacts')
      .insert(contact)
      .select('id, name, email, phone')
      .single();
    if (error) throw error;
    return data;
  }

  /**
   * Checks whether an error occurred and then sets the message for the UI.
   *
   * @param {PostgrestError | null} error - The error of the database query.
   * @param {string} message - The message for the user.
   * @returns {boolean} true if an error occurred.
   */
  private hasFailed(error: PostgrestError | null, message: string): boolean {
    if (!error) {
      return false;
    }

    this.errorMessage.set(message);
    return true;
  }
}
