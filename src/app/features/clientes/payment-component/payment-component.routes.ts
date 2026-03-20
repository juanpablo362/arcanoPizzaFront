import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { PaymentComponent } from './payment-component';

export const paymentComponentRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./payment-component').then(m => m.PaymentComponent)
  }
];