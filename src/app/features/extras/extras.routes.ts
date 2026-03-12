import { Routes } from '@angular/router';

export const EXTRAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./extras').then((m) => m.Extras),
  },
];
