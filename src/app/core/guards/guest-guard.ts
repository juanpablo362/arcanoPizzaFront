import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { getUserHomeUrl } from '../auth/role';

/** Si ya hay sesión, no mostrar login/registro. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return router.createUrlTree([getUserHomeUrl(auth.user())]);
  }
  return true;
};
