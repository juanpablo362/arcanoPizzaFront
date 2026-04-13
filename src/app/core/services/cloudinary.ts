import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { API_BASE_URL } from './api';

export interface CloudinarySignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  publicId?: string | null;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
  /** Con interceptores (para pedir firma al backend con JWT). */
  private readonly http = inject(HttpClient);
  /** Sin interceptores (para evitar que se agregue Authorization a Cloudinary). */
  private readonly rawHttp = new HttpClient(inject(HttpBackend));

  getSignature(input: { folder?: string; publicId?: string | null }): Observable<CloudinarySignatureResponse> {
    return this.http.post<CloudinarySignatureResponse>(`${API_BASE_URL}/uploads/cloudinary/signature`, {
      folder: input.folder,
      publicId: input.publicId ?? null,
    });
  }

  uploadImage(file: File, input: { folder?: string; publicId?: string | null }): Observable<CloudinaryUploadResult> {
    return this.getSignature(input).pipe(
      switchMap((sig) => {
        const url = `https://api.cloudinary.com/v1_1/${encodeURIComponent(sig.cloudName)}/auto/upload`;
        const fd = new FormData();
        fd.append('file', file);
        fd.append('api_key', sig.apiKey);
        fd.append('timestamp', String(sig.timestamp));
        fd.append('signature', sig.signature);
        fd.append('folder', sig.folder);
        if (sig.publicId) fd.append('public_id', sig.publicId);
        return this.rawHttp.post<CloudinaryUploadResult>(url, fd);
      }),
    );
  }
}

