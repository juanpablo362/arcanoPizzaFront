import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ContactoComponent } from './contacto-component';

export const contactoComponentRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./contacto-component').then(m => m.ContactoComponent)
  }
];