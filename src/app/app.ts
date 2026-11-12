import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './components/nav-bar/nav-bar';
import { Header } from './components/header/header';
import { ToastSuccess } from './components/elements/toast-succsess/toast-succsess';
import { TaskDialog } from './components/content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from './components/content-tasks/task-edit-dialog/task-edit-dialog';

@Component({
  imports: [Header, RouterOutlet, NavBar, TaskDialog, TaskEditDialog],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join');

}
