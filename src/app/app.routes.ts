import { Routes } from '@angular/router';
import { ContentContacts } from './components/content-contacts/content-contacts';
import { ContentLegal } from './components/content-legal/content-legal';
import { ContentPrivacy } from './components/content-privacy/content-privacy';
import { ContentHelp } from './components/content-help/content-help';
import { AddTask } from './components/content-add-task/add-task/add-task'; // TEMPORAL: borrar antes del commit
import { AddTaskDialog } from './components/content-add-task/add-task-dialog/add-task-dialog'; // TEMPORAL: borrar antes del commit

export const routes: Routes = [
  {
    path: 'contacts',
    component: ContentContacts,
  },
  {
    path: 'legal-notice',
    component: ContentLegal,
  },
  {
    path: 'privacy-policy',
    component: ContentPrivacy,
  },
  {
    path: 'help',
    component: ContentHelp,
  },
  {
    path: 'add-task',
    component: AddTask,
  },
  {
    path: 'add-task-dialog',
    component: AddTaskDialog,
  },
  {
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full',
  },
];
