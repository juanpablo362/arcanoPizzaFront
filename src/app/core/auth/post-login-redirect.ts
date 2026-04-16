const STORAGE_KEY = 'arcano_post_login_nav';

export interface PostLoginPayload {
  path: string;
  state?: unknown;
}

/** Evita open redirects: solo rutas relativas internas. */
export function sanitizeReturnUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return null;
  if (trimmed.includes('://')) return null;
  return trimmed;
}

export function savePostLoginPayload(payload: PostLoginPayload): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // quota / private mode
  }
}

export function consumePostLoginPayload(): PostLoginPayload | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);
    const parsed = JSON.parse(raw) as PostLoginPayload;
    if (typeof parsed?.path === 'string' && parsed.path.startsWith('/') && !parsed.path.startsWith('//')) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}
