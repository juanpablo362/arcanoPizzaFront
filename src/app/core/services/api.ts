import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  protected readonly http = inject(HttpClient);

  // Base URL para la API ArcanoPizza - configurar según entorno
  
  //protected readonly baseUrl = '/api';

  protected readonly baseUrl = 'https://localhost:7030/api';
}
