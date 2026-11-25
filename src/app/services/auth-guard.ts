import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from './supabase';

export const supabaseAuthGuard = () => {
  const supabaseService = inject(Supabase);
  const router = inject(Router);

  return supabaseService.getUser().then(({ data: { user } }) => {
    if (user) {
      return true;
    } else {
      return router.createUrlTree(['/login']);
    }
  });
};