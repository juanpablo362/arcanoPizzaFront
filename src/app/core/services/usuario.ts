import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends ApiService {

  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios`);
  }

  crearUsuario(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/usuarios`, data);
  }

  actualizarUsuario(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/usuarios/${id}`, data);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/usuarios/${id}`);
  }

  toggleUsuario(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/usuarios/${id}/toggle`, {});
  }
}
//avance