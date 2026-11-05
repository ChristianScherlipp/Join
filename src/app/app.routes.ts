import { Routes } from '@angular/router';
import { ContentContacts } from './components/content-contacts/content-contacts';
import { ContentLegal } from './components/content-legal/content-legal';

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
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full',
  },
];
