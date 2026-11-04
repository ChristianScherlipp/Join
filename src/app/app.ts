import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Supabase } from './services/supabase';
import { NavBar } from './components/nav-bar/nav-bar';
import { Header } from './components/header/header';

@Component({
  imports: [Header, RouterOutlet, NavBar],
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
