import { HttpErrorResponse } from '@angular/common/http';

export function getHttpErrorMessage(err: HttpErrorResponse): string {
  if (err.error instanceof ErrorEvent) {
    return err.error.message;
  }
  const e = err.error;
  if (typeof e === 'string' && e.trim()) {
    return e;
  }
  if (e && typeof e === 'object') {
    const rec = e as Record<string, unknown>;
    if (typeof rec['message'] === 'string') {
      return rec['message'];
    }
    if (typeof rec['detail'] === 'string') {
      return rec['detail'];
    }
    if (typeof rec['title'] === 'string') {
      return rec['title'];
    }
    const errors = rec['errors'] as
      | Record<string, string[] | string>
      | undefined;
    if (errors) {
      for (const v of Object.values(errors)) {
        if (Array.isArray(v) && v[0]) {
          return v[0];
        }
        if (typeof v === 'string') {
          return v;
        }
      }
    }
  }
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }
  return err.message || 'Ha ocurrido un error.';
}
