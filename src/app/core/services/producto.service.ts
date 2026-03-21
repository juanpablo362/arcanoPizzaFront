import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';
import { Producto } from '../../shared/models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService extends ApiService { // Heredamos de tu clase base

  // Llama a GET https://localhost:7030/api/Productos
  obtenerTodos(): Observable<Producto[]> {
    // Usamos this.http y this.baseUrl que ya vienen configurados desde ApiService
    return this.http.get<Producto[]>(`${this.baseUrl}/Productos`);
  }
  
}