import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly http = inject(HttpClient);

  // Base URL para la API ArcanoPizza - configurar según entorno
  protected readonly baseUrl = 'http://localhost:5010/api/admin'; // Cambiar a la URL real de la API
}