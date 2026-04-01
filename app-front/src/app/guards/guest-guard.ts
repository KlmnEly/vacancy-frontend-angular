import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.userId() && !auth.isTokenExpired()) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};