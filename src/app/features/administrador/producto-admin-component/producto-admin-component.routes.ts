import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ProductoAdminComponent } from './producto-admin-component';

export const MENU_ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./producto-admin-component').then(m => m.ProductoAdminComponent)
  }
  ];