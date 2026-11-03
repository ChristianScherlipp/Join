import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './services/supabase';
import { NavBar } from './components/nav-bar/nav-bar';

@Component({
  imports: [RouterOutlet, NavBar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join');

  dataBase = inject(Supabase);

  async ngOnInit() {
    await this.dataBase.getUsers();
    this.dataBase.subscribeToUsers();
  }
}
