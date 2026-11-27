import { Injectable, OnDestroy, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../enviroments/enviroments';

/**
 * Provides the shared Supabase client and authentication state.
 */
@Injectable({
  providedIn: 'root',
})
export class Supabase implements OnDestroy {
  readonly supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  readonly isLoggedIn = signal(false);
  readonly userName = signal('Guest');
  readonly authReady = signal(false);
  readonly showIntro = signal(false);

  private unsubscribeAuth?: () => void;

  constructor() {
    // Watches the initial session and later login/logout changes.
    const { data } = this.supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user;

        this.isLoggedIn.set(!!user);

        if (!user) {
          this.userName.set('Guest');
        } else if (user.is_anonymous) {
          this.userName.set('Guest');
        } else {
          const name = user.user_metadata?.['name'];

          this.userName.set(
            typeof name === 'string' && name.trim()
              ? name.trim()
              : 'User'
          );
        }

        this.authReady.set(true);
      }
    );

    this.unsubscribeAuth = () => data.subscription.unsubscribe();
  }

  /**
   * Removes the authentication listener when the service is destroyed.
   */
  ngOnDestroy(): void {
    this.unsubscribeAuth?.();
  }

  /**
   * Creates a registered user.
   */
  async signUp(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
  }

  /**
   * Signs in a registered user.
   */
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  /**
   * Signs out the current user.
   */
  async signOut() {
    return this.supabase.auth.signOut();
  }

  /**
   * Fetches the current user from Supabase.
   */
  getUser() {
    return this.supabase.auth.getUser();
  }

  /**
   * Creates a guest session without email or password.
   */
  async signInAsGuest() {
    return this.supabase.auth.signInAnonymously();
  }
}