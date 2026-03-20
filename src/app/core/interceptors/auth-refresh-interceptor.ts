import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

function isAuthEndpointUrl(url: string): boolean {
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/register') ||
    url.includes('/api/auth/refresh') ||
    url.includes('/api/auth/logout')
  );
}

export const authRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) {
        return throwError(() => err);
      }
      if (isAuthEndpointUrl(req.url)) {
        return throwError(() => err);
      }
      if (!auth.refreshToken()) {
        return throwError(() => err);
      }
      return auth.refreshTokens().pipe(
        switchMap(() => {
          const access = auth.accessToken();
          if (!access) {
            auth.invalidateSession();
            return throwError(() => err);
          }
          const retry = req.clone({
            setHeaders: { Authorization: `Bearer ${access}` },
          });
          return next(retry);
        }),
        catchError(() => {
          auth.invalidateSession();
          return throwError(() => err);
        })
      );
    })
  );
};
