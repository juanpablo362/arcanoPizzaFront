import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, API_BASE_URL } from './api';

@Injectable({
  providedIn: 'root'
})
export class ProductoService extends ApiService {
  constructor() {
    super();
    this.baseUrl = `${API_BASE_URL}/admin`;
  }

  obtenerProductos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/productos`);
  }

  crearProducto(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/productos`, data);
  }

  actualizarProducto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/productos/${id}`, data);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/productos/${id}`);
  }

  // 🔥 NUEVO: Método dedicado solo para apagar/prender
  toggleProducto(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/productos/${id}/toggle`, {});
  }
}