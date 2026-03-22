import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard-component';

export const MENU_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-component').then(m => m.DashboardComponent)
  }
];