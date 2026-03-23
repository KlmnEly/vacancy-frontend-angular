import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { isPlatformBrowser } from '@angular/common'; // <--- Importante

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID); 

  if (!isPlatformBrowser(platformId)) {
    return true; 
  }

  auth.loadToken();

  const userRole = auth.userId() ? auth.role()?.toUpperCase() : null; 

  const allowedRoles = route.data?.['roles'] || route.parent?.data?.['roles'];

  if (!userRole || auth.isTokenExpired()) {
    router.navigate(['/login']);
    return false;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};