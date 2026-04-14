import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { getUserHomeUrl } from '../auth/role';
import { sanitizeReturnUrl } from '../auth/post-login-redirect';

/** Si ya hay sesión, no mostrar login/registro. */
export const guestGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return true;
  }
  const returnUrl = sanitizeReturnUrl(route.queryParams['returnUrl']);
  if (returnUrl) {
    return router.parseUrl(returnUrl);
  }
  return router.createUrlTree([getUserHomeUrl(auth.user())]);
};
