import { Routes } from '@angular/router';
import { ContentContacts } from './components/content-contacts/content-contacts';
import { ContentLegal } from './components/content-legal/content-legal';
import { ContentPrivacy } from './components/content-privacy/content-privacy';
import { ContentHelp } from './components/content-help/content-help';
import { AddTask } from './components/content-add-task/add-task/add-task';
import { AddTaskDialog } from './components/content-add-task/add-task-dialog/add-task-dialog';
import { ContentBoard } from './components/content-board/content-board';
import { ContentLogin } from './components/content-login/content-login';
import { ContentSummary } from './components/content-summary/content-summary';
import { Login } from './components/content-login/login/login';
import { Signup } from './components/content-login/signup/signup';
import { supabaseAuthGuard } from './services/auth-guard';

/**
 * All pages of the application. The start page redirects to the contacts.
 */
export const routes: Routes = [
  {
    path: 'login',
    component: ContentLogin,
    data: { signup: false }
  },
  {
    path: 'signup',
    component: ContentLogin,
    data: { signup: true }
  },
  {
    path: 'summary',
    component: ContentSummary,
    canActivate: [supabaseAuthGuard],
  },
  {
    path: 'board',
    component: ContentBoard,
    canActivate: [supabaseAuthGuard],
  },
  {
    path: 'contacts',
    component: ContentContacts,
    canActivate: [supabaseAuthGuard],
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
    canActivate: [supabaseAuthGuard],
  },
  {
    path: 'add-task-dialog',
    component: AddTaskDialog,
    canActivate: [supabaseAuthGuard],
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
