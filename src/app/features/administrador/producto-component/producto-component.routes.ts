import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ProductoComponent } from './producto-component';

export const MENU_PRODUCTOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./producto-component').then(m => m.ProductoComponent)
  }
];