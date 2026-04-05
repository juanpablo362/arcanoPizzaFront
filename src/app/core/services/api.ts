import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
    protected readonly http = inject(HttpClient);

  protected readonly baseUrl = 'https://localhost:7030/api/admin';
}
