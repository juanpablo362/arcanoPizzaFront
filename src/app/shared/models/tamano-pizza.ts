/** Opción de tamaño unificada para UI y carrito (después de normalizar la respuesta de la API). */
export interface TamanoPizzaOpcion {
  tamanoPizzaId: number | null;
  name: string;
  /** Texto corto para el círculo (cm, rebanadas, etc.). */
  cm: string;
  price: number;
  /** Línea secundaria: personas, porciones, forma. */
  detalle?: string;
}

function num(...vals: unknown[]): TamanoPizzaOpcion['tamanoPizzaId'] {
  for (const v of vals) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function str(v: unknown, fallback: string): string {
  if (v == null || v === '') return fallback;
  return String(v);
}

/**
 * Interpreta el array `tamanos` / `Tamanos` que venga en cada producto (camelCase o PascalCase típico de .NET).
 */
export function extraerTamanosDeProducto(producto: any): TamanoPizzaOpcion[] {
  const raw = producto?.tamanos ?? producto?.Tamanos;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.map((t: any) => {
    const id = num(
      t.tamanoPizzaId,
      t.idTamanoPizza,
      t.TamanoPizzaId,
      t.IdTamanoPizza,
      t.id,
      t.Id,
    );
    const name = str(t.nombre ?? t.name ?? t.Nombre, 'Tamaño');
    const precio = Number(t.precio ?? t.price ?? t.Precio ?? producto?.precio ?? 0);

    let cm = '';
    if (t.cm != null && String(t.cm).trim() !== '') cm = String(t.cm);
    else if (t.centimetros != null) cm = `${t.centimetros} cm`;
    else if (t.diametroCm != null) cm = `${t.diametroCm} cm`;
    else if (t.Centimetros != null) cm = `${t.Centimetros} cm`;
    else if (t.DiametroCm != null) cm = `${t.DiametroCm} cm`;

    const rebanadas = t.rebanadas ?? t.Rebanadas ?? t.porciones ?? t.Porciones;
    if (!cm && rebanadas != null) cm = `${rebanadas} reb.`;

    const personas = t.personas ?? t.Personas ?? t.rindePara ?? t.RindePara;
    const detalleParts: string[] = [];
    if (personas) detalleParts.push(String(personas));
    if (rebanadas != null) detalleParts.push(`${rebanadas} rebanadas`);
    const forma = t.forma ?? t.Forma;
    if (forma) detalleParts.push(String(forma));

    return {
      tamanoPizzaId: id,
      name,
      cm: cm || '·',
      price: Number.isFinite(precio) ? precio : 0,
      detalle: detalleParts.length ? detalleParts.join(' · ') : undefined,
    };
  });
}

export function esCategoriaPizza(categoriaNombre: string | null | undefined): boolean {
  if (categoriaNombre == null) return false;
  return categoriaNombre.trim().toLowerCase().includes('pizza');
}

/**
 * Catálogo visual tipo menú Arcano cuando el GET /Productos aún no trae `tamanos`.
 * Ajustá `tamanoPizzaId` para que coincidan con tu tabla en la API.
 */
export function tamanosFallbackArcano(precioBase: number): TamanoPizzaOpcion[] {
  const base = Number(precioBase);
  const b = Number.isFinite(base) && base > 0 ? base : 100;
  const r = (x: number) => Math.round(x * 100) / 100;
  return [
    {
      tamanoPizzaId: 1,
      name: 'Personal',
      cm: '6 reb.',
      price: r(b * 0.72),
      detalle: '1 persona · 6 rebanadas · circular',
    },
    {
      tamanoPizzaId: 2,
      name: 'Mediana',
      cm: '8 reb.',
      price: r(b * 0.88),
      detalle: '4–5 personas · 8 rebanadas · circular',
    },
    {
      tamanoPizzaId: 3,
      name: 'Grande',
      cm: '8 reb.',
      price: r(b),
      detalle: '5–6 personas · 8 rebanadas · circular',
    },
    {
      tamanoPizzaId: 4,
      name: 'XL Familiar',
      cm: '12 reb.',
      price: r(b * 1.15),
      detalle: '5 personas · 12 rebanadas · circular',
    },
    {
      tamanoPizzaId: 5,
      name: 'ToogiRex',
      cm: '16 reb.',
      price: r(b * 1.35),
      detalle: '16 rebanadas · rectangular',
    },
  ];
}

/** Expone siempre `tamanos` como lista lista para la pantalla de detalle. */
export function enriquecerProductoConTamanos(producto: any): any {
  const fromApi = extraerTamanosDeProducto(producto);
  const tamanos =
    fromApi.length > 0
      ? fromApi
      : esCategoriaPizza(producto?.categoriaNombre)
        ? tamanosFallbackArcano(Number(producto?.precio))
        : [];
  return { ...producto, tamanos };
}
