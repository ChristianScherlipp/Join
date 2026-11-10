import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './components/nav-bar/nav-bar';
import { Header } from './components/header/header';
import { ToastSuccess } from './components/elements/toast-succsess/toast-succsess';

@Component({
  imports: [Header, RouterOutlet, NavBar],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join');

}
