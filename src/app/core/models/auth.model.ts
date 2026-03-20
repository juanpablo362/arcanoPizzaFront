/** Cuerpo enviado a POST /api/auth/login */
export interface LoginApiRequest {
  correo: string;
  password: string;
}

/** Cuerpo enviado a POST /api/auth/register */
export interface RegisterApiRequest {
  nombreUsuario: string;
  correo: string;
  password: string;
  telefono: string | null;
}

/** Usuario devuelto por la API dentro de login/refresh */
export interface UsuarioApiDto {
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  rol: string;
}

/** Respuesta JSON de login y refresh */
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  usuario: UsuarioApiDto;
}

/** Estado de sesión en el front (UI y guards) */
export interface AuthUser {
  idUsuario: number;
  nombreUsuario: string;
  correo: string;
  rol: string;
  /** Alias para plantillas que ya usan `name` */
  name: string;
}

export interface ParsedAuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: AuthUser;
}

function asRecord(body: unknown): Record<string, unknown> | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  return body as Record<string, unknown>;
}

export function mapUsuarioApi(u: UsuarioApiDto): AuthUser {
  return {
    idUsuario: u.idUsuario,
    nombreUsuario: u.nombreUsuario,
    correo: u.correo,
    rol: u.rol,
    name: u.nombreUsuario,
  };
}

function parseUsuarioApi(raw: unknown): AuthUser | null {
  const o = asRecord(raw);
  if (!o) {
    return null;
  }
  const idRaw = o['idUsuario'];
  const id =
    typeof idRaw === 'number'
      ? idRaw
      : typeof idRaw === 'string'
        ? Number(idRaw)
        : NaN;
  const nombreUsuario = o['nombreUsuario'];
  const correo = o['correo'];
  const rol = o['rol'];
  if (
    !Number.isFinite(id) ||
    typeof nombreUsuario !== 'string' ||
    typeof correo !== 'string' ||
    typeof rol !== 'string'
  ) {
    return null;
  }
  return mapUsuarioApi({
    idUsuario: id,
    nombreUsuario,
    correo,
    rol,
  });
}

/** Valida y normaliza la respuesta de login o refresh (requiere ambos tokens y usuario). */
export function parseAuthTokenResponse(body: unknown): ParsedAuthSession | null {
  const o = asRecord(body);
  if (!o) {
    return null;
  }
  const access =
    typeof o['accessToken'] === 'string' ? o['accessToken'] : null;
  const refresh =
    typeof o['refreshToken'] === 'string' ? o['refreshToken'] : null;
  if (!access || !refresh) {
    return null;
  }
  const user = parseUsuarioApi(o['usuario']);
  if (!user) {
    return null;
  }
  let expiresAt: number | undefined;
  const exp = o['expiresIn'];
  if (typeof exp === 'number' && Number.isFinite(exp)) {
    expiresAt = Date.now() + exp * 1000;
  }
  return {
    accessToken: access,
    refreshToken: refresh,
    expiresAt,
    user,
  };
}
