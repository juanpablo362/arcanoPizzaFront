import {ApplicationConfig, provideBrowserGlobalErrorListeners,} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { authInterceptor } from './core/interceptors/auth-interceptor';
import { errorInterceptor } from './core/interceptors/error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(), // <-- Soluciona la advertencia de rendimiento y SSR
      withInterceptors([authInterceptor, errorInterceptor]) // <-- Mantiene tu seguridad y OWASP al 100%
    ),
  ],
};