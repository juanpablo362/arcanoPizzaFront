import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExtrasService {
  private readonly http = inject(HttpClient);

  // Llamadas a /api/Extras cuando la API esté disponible
  // getAll() { return this.http.get<Extra[]>('/api/Extras'); }
}
