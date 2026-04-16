import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { PedidosComponent } from './pedidos-component';

export const promocionesComponentRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./pedidos-component').then(m => m.PedidosComponent)
  }
];