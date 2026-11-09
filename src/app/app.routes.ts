import { Routes } from '@angular/router';
import { ContentContacts } from './components/content-contacts/content-contacts';
import { ContentLegal } from './components/content-legal/content-legal';
import { ContentPrivacy } from './components/content-privacy/content-privacy';

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
    path: '',
    redirectTo: 'contacts',
    pathMatch: 'full',
  },
];
