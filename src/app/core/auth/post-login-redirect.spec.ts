import { sanitizeReturnUrl } from './post-login-redirect';

describe('sanitizeReturnUrl', () => {
  it('acepta rutas internas relativas', () => {
    expect(sanitizeReturnUrl('/carrito')).toBe('/carrito');
    expect(sanitizeReturnUrl('/producto')).toBe('/producto');
  });

  it('descarta open redirects externos', () => {
    expect(sanitizeReturnUrl('https://evil.test')).toBeNull();
    expect(sanitizeReturnUrl('//evil.test')).toBeNull();
    expect(sanitizeReturnUrl('http://evil.test/phishing')).toBeNull();
  });

  it('descarta valores no string o vacíos', () => {
    expect(sanitizeReturnUrl(null)).toBeNull();
    expect(sanitizeReturnUrl(undefined)).toBeNull();
    expect(sanitizeReturnUrl(12)).toBeNull();
    expect(sanitizeReturnUrl('carrito')).toBeNull();
  });
});
