import { Routes } from '@angular/router';
import { PagoExito } from './pago-exito';

export const PAGO_EXITO_ROUTES: Routes = [
  {
    path: '', // La ruta queda vacía porque el nombre principal se lo daremos en app.routes.ts
    component: PagoExito
  }
];