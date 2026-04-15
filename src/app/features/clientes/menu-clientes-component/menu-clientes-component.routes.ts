import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { MenuClientesComponent } from "./menu-clientes-component";

export const MENU_CLIENTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./menu-clientes-component').then(m => m.MenuClientesComponent)
  }
];