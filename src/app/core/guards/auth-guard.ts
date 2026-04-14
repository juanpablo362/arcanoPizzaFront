import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { sanitizeReturnUrl } from '../auth/post-login-redirect';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) {
    return true;
  }
  const returnUrl = sanitizeReturnUrl(state.url);
  return router.createUrlTree(['/auth'], returnUrl ? { queryParams: { returnUrl } } : {});
};
