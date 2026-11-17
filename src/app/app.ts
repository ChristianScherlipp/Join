import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBar } from './components/nav-bar/nav-bar';
import { Header } from './components/header/header';
import { ToastSuccess } from './components/elements/toast-succsess/toast-succsess';
import { TaskDialog } from './components/content-tasks/task-dialog/task-dialog';
import { TaskEditDialog } from './components/content-tasks/task-edit-dialog/task-edit-dialog';
import { TaskWithContacts } from './interfaces/task';


@Component({
  imports: [Header, RouterOutlet, NavBar, TaskDialog, TaskEditDialog,],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('join');


//   Testdaten
//   showTestDialog = true;
//   testTask: TaskWithContacts = {
//   id: 1,
//   created_at: null,
//   title: 'Testaufgabe',
//   description: 'Dialog testen',
//   date: '2026-11-20',
//   worker_id: [],
//   assignedContacts: [],
//   subtask: [
//     { title: 'Design prüfen', completed: false },
//   ],
//   category: 'User Story',
//   priority: 'medium',
//   status: 'todo',
// };
}
