import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { getUserHomeUrl, isAppRole, type AppRole } from '../auth/role';

export function roleGuard(allowedRoles: readonly AppRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) return router.createUrlTree(['/auth']);

    const role = auth.user()?.rol;
    if (!isAppRole(role)) return router.createUrlTree([getUserHomeUrl(auth.user())]);

    if (allowedRoles.includes(role)) return true;
    return router.createUrlTree([getUserHomeUrl(auth.user())]);
  };
}

