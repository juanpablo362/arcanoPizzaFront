import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class ProductoService extends ApiService {

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
}